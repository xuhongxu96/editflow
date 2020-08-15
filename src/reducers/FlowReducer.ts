import { FlowState, makeEdgeState, makePortMeta, IPortMeta } from 'models/FlowState';
import * as Basic from 'models/BasicTypes';
import {
  valueof,
  expandRect,
  isContained,
  limitRect,
  expandRectToContain,
  getPortPosition,
  getPortDraftPosition,
  DecomposeHandleDirection,
} from 'utils';
import { Dispatch, Reducer } from 'react';
import { Flow, Node, Edge } from 'models/Flow';
import { HandleDirection } from 'components/HandleBox';
import { CanvasStyle } from 'models/CanvasStyle';
import { Map, Set, List } from 'immutable';

function updateStateForNode(flow: FlowState, id: string, node: Node) {
  flow.update('nodeIdQuadTree', u => u.insert(node.layout, id));
  flow.set('nodeBound', Basic.makeRect(expandRectToContain(flow.nodeBound, node.layout)));
  {
    const inputPortMap = Map<string, number>().asMutable();
    const inputPortEdgeMap = (
      flow.inputPortEdgeMap.get(id) ?? Map<string, Set<string>>()
    ).asMutable();
    node.input.forEach((port, i) => {
      inputPortMap.set(port.name, i);
      inputPortEdgeMap.set(port.name, Set<string>());
    });
    flow.set('inputPortEdgeMap', flow.inputPortEdgeMap.set(id, inputPortEdgeMap.asImmutable()));
    flow.set('inputPortMap', flow.inputPortMap.set(id, inputPortMap.asImmutable()));
  }
  {
    const outputPortMap = Map<string, number>().asMutable();
    const outputPortEdgeMap = (
      flow.outputPortEdgeMap.get(id) ?? Map<string, Set<string>>()
    ).asMutable();
    node.output.forEach((port, i) => {
      outputPortMap.set(port.name, i);
      outputPortEdgeMap.set(port.name, Set<string>());
    });
    flow.set('outputPortEdgeMap', flow.outputPortEdgeMap.set(id, outputPortEdgeMap.asImmutable()));
    flow.set('outputPortMap', flow.outputPortMap.set(id, outputPortMap.asImmutable()));
  }
  flow.set('nodeEdgeMap', flow.nodeEdgeMap.set(id, Set<string>()));
}

function removeStateForNode(flow: FlowState, id: string, node: Node) {
  flow.update('nodeIdQuadTree', u => u.remove(node.layout, id));

  flow.set('inputPortEdgeMap', flow.inputPortEdgeMap.delete(id));
  flow.set('outputPortEdgeMap', flow.outputPortEdgeMap.delete(id));

  flow.set('inputPortMap', flow.inputPortMap.delete(id));
  flow.set('outputPortMap', flow.outputPortMap.delete(id));
  flow.set('nodeEdgeMap', flow.nodeEdgeMap.delete(id));

  flow.set('visibleNodeIds', flow.visibleNodeIds.delete(id));
  flow.set('highlightedNodeIds', flow.highlightedNodeIds.delete(id));
  flow.set('selectedNodeIds', flow.selectedNodeIds.delete(id));
  flow.set('newlyVisibleNodeIds', List<string>());
  if (flow.hoveredNodeId === id) flow.set('hoveredNodeId', undefined);
}

function updateStateForEdge(flow: FlowState, id: string, edge: Edge) {
  const startNode = flow.raw.nodes[edge.start.nodeId];
  const endNode = flow.raw.nodes[edge.end.nodeId];

  const startPortIndex = flow.outputPortMap.get(edge.start.nodeId)!.get(edge.start.portName);
  const endPortIndex = flow.inputPortMap.get(edge.end.nodeId)!.get(edge.end.portName);

  flow.set(
    'nodeEdgeMap',
    flow.nodeEdgeMap.withMutations(m => {
      m.update(edge.start.nodeId, u => u.add(id)).update(edge.end.nodeId, u => u.add(id));
    })
  );

  flow.set(
    'outputPortEdgeMap',
    flow.outputPortEdgeMap.updateIn([edge.start.nodeId, edge.start.portName], u => u?.add(id))
  );
  flow.set(
    'inputPortEdgeMap',
    flow.inputPortEdgeMap.updateIn([edge.end.nodeId, edge.end.portName], u => u?.add(id))
  );

  flow.set(
    'edgeStateMap',
    flow.edgeStateMap.set(
      id,
      makeEdgeState({
        start: getPortPosition(startNode, 'output', startPortIndex!),
        end: getPortPosition(endNode, 'input', endPortIndex!),
      })
    )
  );
}

function removeStateForEdge(flow: FlowState, id: string, edge: Edge) {
  flow.set(
    'nodeEdgeMap',
    flow.nodeEdgeMap.withMutations(m2 => {
      m2.update(edge.start.nodeId, u => u.delete(id)).update(edge.end.nodeId, u => u.delete(id));
    })
  );

  flow.set(
    'outputPortEdgeMap',
    flow.outputPortEdgeMap.updateIn([edge.start.nodeId, edge.start.portName], u => u.delete(id))
  );
  flow.set(
    'inputPortEdgeMap',
    flow.inputPortEdgeMap.updateIn([edge.end.nodeId, edge.end.portName], u => u.delete(id))
  );

  flow.set('edgeStateMap', flow.edgeStateMap.delete(id));

  flow.set('visibleEdgeIds', flow.visibleEdgeIds.delete(id));
  flow.set('highlightedEdgeIds', flow.highlightedEdgeIds.delete(id));
  flow.set('selectedEdgeIds', flow.selectedEdgeIds.delete(id));
  flow.set('newlyVisibleEdgeIds', flow.newlyVisibleEdgeIds.delete(id));
}

export interface UndoAction {
  action: FlowAction;
  undoFn: (flow: FlowState, style: CanvasStyle) => void;
}
type ReducerReturnType = UndoAction | void | null | undefined;

const reducers = {
  init: (flow: FlowState, action: { flow: Flow }): ReducerReturnType => {
    flow.update('nodeIdQuadTree', u => u.clear());

    flow
      .set('raw', action.flow)
      .set('draftNodeLayout', Map())
      .set('cachedViewBound', Basic.makeRect())
      .set('nodeBound', Basic.makeRect())
      .set('newlyVisibleNodeIds', List())
      .set('visibleNodeIds', Set())
      .set('selectedNodeIds', Set())
      .set('inputPortMap', Map())
      .set('outputPortMap', Map())
      .set('nodeEdgeMap', Map())
      .set('inputPortEdgeMap', Map())
      .set('outputPortEdgeMap', Map())
      .set('edgeStateMap', Map())
      .set('newlyVisibleEdgeIds', Set())
      .set('visibleEdgeIds', Set())
      .set('selectedEdgeIds', Set());

    Object.entries(action.flow.nodes).forEach(([id, node]) => {
      updateStateForNode(flow, id, node);
    });

    Object.entries(action.flow.edges).forEach(([id, edge]) => {
      updateStateForEdge(flow, id, edge);
    });

    reducers.updateVisibleNodes(flow, { cacheExpandSize: 500 });
  },
  setScale: (flow: FlowState, action: { scale: number }): ReducerReturnType => {
    flow.set('scale', action.scale);
  },
  setViewOffset: (
    flow: FlowState,
    action: { offset: Basic.IOffset },
    style: CanvasStyle
  ): ReducerReturnType => {
    flow.set(
      'viewBound',
      Basic.makeRect(
        limitRect(
          { w: flow.viewBound.w, h: flow.viewBound.h, ...action.offset },
          expandRect(flow.nodeBound, style.margin, flow.scale)
        )
      )
    );
  },
  updateViewOffsetByDelta: (
    flow: FlowState,
    action: { delta: Basic.IOffset },
    style: CanvasStyle
  ): ReducerReturnType => {
    flow.set(
      'viewBound',
      Basic.makeRect(
        limitRect(
          {
            w: flow.viewBound.w,
            h: flow.viewBound.h,
            x: flow.viewBound.x + action.delta.x,
            y: flow.viewBound.y + action.delta.y,
          },
          expandRect(flow.nodeBound, style.margin, flow.scale)
        )
      )
    );
  },
  updateClientSize: (flow: FlowState, action: { clientRect: Basic.IRect }): ReducerReturnType => {
    flow
      .set('clientRect', Basic.makeRect(action.clientRect))
      .setIn(['viewBound', 'w'], action.clientRect.w)
      .setIn(['viewBound', 'h'], action.clientRect.h);
  },
  updateNewlyVisibleNodes: (flow: FlowState, action: {}): ReducerReturnType => {
    if (!isContained(flow.cachedViewBound, flow.viewBound)) {
      const viewBoundToCache = flow.viewBound;
      flow.set(
        'newlyVisibleNodeIds',
        List(
          flow.nodeIdQuadTree
            .getCoveredData(viewBoundToCache)
            .filter(i => !flow.visibleNodeIds.has(i))
            .sort()
        )
      );
      flow.set('cachedViewBound', viewBoundToCache);
    }
  },
  updateVisibleNodes: (flow: FlowState, action: { cacheExpandSize: number }): ReducerReturnType => {
    const viewBoundToCache = expandRect(flow.viewBound, action.cacheExpandSize);
    flow
      .set('newlyVisibleNodeIds', List())
      .set('visibleNodeIds', Set(flow.nodeIdQuadTree.getCoveredData(viewBoundToCache)))
      .set('cachedViewBound', Basic.makeRect(viewBoundToCache));
  },
  updateNewlyVisibleEdges: (flow: FlowState, action: { nodeIds: string[] }): ReducerReturnType => {
    const newlyVisibleEdgeIds = action.nodeIds.reduce((p, nodeId) => {
      flow.nodeEdgeMap.get(nodeId)!.forEach(i => p.add(i));
      return p;
    }, Set<string>().asMutable());
    flow.visibleEdgeIds.forEach(id => newlyVisibleEdgeIds.delete(id));
    flow.set('newlyVisibleEdgeIds', newlyVisibleEdgeIds.asImmutable());
  },
  updateVisibleEdges: (flow: FlowState, action: { nodeIds: string[] }): ReducerReturnType => {
    flow.set('newlyVisibleEdgeIds', Set()).set(
      'visibleEdgeIds',
      action.nodeIds
        .reduce((p, nodeId) => {
          flow.nodeEdgeMap.get(nodeId)?.forEach(i => p.add(i));
          return p;
        }, Set<string>().asMutable())
        .asImmutable()
    );
  },
  setHighlightedEdges: (flow: FlowState, action: { ids: string[] }): ReducerReturnType => {
    flow.set('highlightedEdgeIds', Set(action.ids));
  },
  setSelectEdges: (flow: FlowState, action: { ids: string[] }): ReducerReturnType => {
    flow.set('selectedEdgeIds', Set(action.ids));
  },
  addSelectEdges: (flow: FlowState, action: { ids: string[] }): ReducerReturnType => {
    flow.update('selectedEdgeIds', u =>
      u.withMutations(m => {
        action.ids.forEach(id => m.add(id));
      })
    );
  },
  unselectAllEdges: (flow: FlowState, action: {} = {}): ReducerReturnType => {
    flow.set('selectedEdgeIds', Set());
  },
  setHoveredNode: (flow: FlowState, action: { id: string }): ReducerReturnType => {
    flow.set('hoveredNodeId', action.id);
  },
  unsetHoveredNode: (flow: FlowState, action: {} = {}): ReducerReturnType => {
    flow.set('hoveredNodeId', undefined);
  },
  setHighlightedNodes: (flow: FlowState, action: { ids: string[] }): ReducerReturnType => {
    flow.set('highlightedNodeIds', Set(action.ids));
  },
  setSelectNodes: (flow: FlowState, action: { ids: string[] }): ReducerReturnType => {
    flow.set('selectedNodeIds', Set(action.ids));
  },
  addSelectNodes: (flow: FlowState, action: { ids: string[] }): ReducerReturnType => {
    flow.update('selectedNodeIds', u =>
      u.withMutations(m => {
        action.ids.forEach(id => m.add(id));
      })
    );
  },
  unselectNodes: (flow: FlowState, action: { ids: string[] }): ReducerReturnType => {
    flow.update('selectedNodeIds', u =>
      u.withMutations(m => {
        action.ids.forEach(id => m.delete(id));
      })
    );
  },
  unselectAllNodes: (flow: FlowState, action: {} = {}): ReducerReturnType => {
    flow.set('selectedNodeIds', Set());
  },
  toggleNodes: (flow: FlowState, action: { ids: string[] }): ReducerReturnType => {
    flow.update('selectedNodeIds', u =>
      u.withMutations(m => {
        action.ids.forEach(id => {
          if (flow.selectedNodeIds.has(id)) {
            m.delete(id);
          } else {
            m.add(id);
          }
        });
      })
    );
  },
  moveSelectedNodes: (flow: FlowState, action: { offset: Basic.IOffset }): ReducerReturnType => {
    flow.selectedNodeIds.forEach(id => {
      const node = flow.raw.nodes[id];
      const draftLayout = {
        x: node.layout.x + action.offset.x,
        y: node.layout.y + action.offset.y,
        w: node.layout.w,
        h: node.layout.h,
      };
      flow.update('draftNodeLayout', u => u.set(id, Basic.makeRect(draftLayout)));
      reducers.updateEdgeStates(flow, { nodeId: id, draft: true });
    });
  },
  stopMovingNodes: (flow: FlowState, action: { cancel: boolean }): ReducerReturnType => {
    if (flow.draftNodeLayout.isEmpty()) return;
    if (action.cancel) {
      flow.set('draftNodeLayout', Map());
      return;
    }

    const undo = reducers.setNodeLayout(flow, {
      layouts: Array.from(flow.draftNodeLayout.entries()),
    });
    flow.set('draftNodeLayout', Map());
    return undo;
  },
  setNodeLayout: (
    flow: FlowState,
    action: { layouts: [string, Basic.IRect][] }
  ): ReducerReturnType => {
    const oldLayouts = action.layouts.map(([id, _]) => {
      return [id, flow.raw.nodes[id].layout] as [string, Basic.IRect];
    });

    action.layouts.forEach(o => {
      const [id, layout] = o;
      flow.update('nodeIdQuadTree', u => u.remove(flow.raw.nodes[id].layout, id));
      flow.setIn(['raw', 'nodes', id, 'layout'], layout);
      flow.update('nodeIdQuadTree', u => u.insert(layout, id));
      flow.set('nodeBound', Basic.makeRect(expandRectToContain(flow.nodeBound, layout)));
      reducers.updateEdgeStates(flow, { nodeId: id });
    });

    return {
      action: { type: 'setNodeLayout', ...action },
      undoFn: undoFlow => {
        reducers.setNodeLayout(undoFlow, { layouts: oldLayouts });
      },
    };
  },
  resizeSelectedNodes: (
    flow: FlowState,
    action: { direction: HandleDirection; offset: Basic.IOffset },
    style: CanvasStyle
  ): ReducerReturnType => {
    const [hDirection, vDirection] = DecomposeHandleDirection(action.direction);

    const draftNodeLayout = flow.draftNodeLayout.asMutable();
    flow.selectedNodeIds.forEach(id => {
      const node = flow.raw.nodes[id];
      const draftLayout = {
        x:
          hDirection === 'left'
            ? Math.min(
                node.layout.x + action.offset.x,
                node.layout.x + node.layout.w - style.minNodeSize.w
              )
            : node.layout.x,

        y:
          vDirection === 'top'
            ? Math.min(
                node.layout.y + action.offset.y,
                node.layout.y + node.layout.h - style.minNodeSize.h
              )
            : node.layout.y,

        w:
          hDirection === 'left'
            ? Math.max(style.minNodeSize.w, node.layout.w - action.offset.x)
            : Math.max(style.minNodeSize.w, node.layout.w + action.offset.x),

        h:
          vDirection === 'middle'
            ? node.layout.h
            : vDirection === 'top'
            ? Math.max(style.minNodeSize.h, node.layout.h - action.offset.y)
            : Math.max(style.minNodeSize.h, node.layout.h + action.offset.y),
      };
      draftNodeLayout.set(id, Basic.makeRect(draftLayout));
      reducers.updateEdgeStates(flow, { nodeId: id, draft: true });
    });
    flow.set('draftNodeLayout', draftNodeLayout.asImmutable());
  },
  stopResizingNodes: (flow: FlowState, action: { cancel: boolean }): ReducerReturnType => {
    return reducers.stopMovingNodes(flow, action);
  },
  updateEdgeStates: (
    flow: FlowState,
    action: { nodeId: string; draft?: boolean }
  ): ReducerReturnType => {
    flow.update('edgeStateMap', u =>
      u.withMutations(m => {
        flow.nodeEdgeMap.get(action.nodeId)!.forEach(edgeId => {
          const edge = flow.raw.edges[edgeId];
          const startNode = flow.raw.nodes[edge.start.nodeId];
          const endNode = flow.raw.nodes[edge.end.nodeId];
          const startPortIndex = flow.outputPortMap
            .get(edge.start.nodeId)
            ?.get(edge.start.portName)!;
          const endPortIndex = flow.inputPortMap.get(edge.end.nodeId)?.get(edge.end.portName)!;

          if (action.draft) {
            m.set(
              edgeId,
              makeEdgeState({
                start: getPortDraftPosition(
                  startNode,
                  flow.draftNodeLayout.get(edge.start.nodeId) ?? startNode.layout,
                  'output',
                  startPortIndex
                ),
                end: getPortDraftPosition(
                  endNode,
                  flow.draftNodeLayout.get(edge.end.nodeId) ?? endNode.layout,
                  'input',
                  endPortIndex
                ),
              })
            );
          } else {
            m.set(
              edgeId,
              makeEdgeState({
                start: getPortPosition(startNode, 'output', startPortIndex),
                end: getPortPosition(endNode, 'input', endPortIndex),
              })
            );
          }
        });
      })
    );
  },
  setSelectPort: (flow: FlowState, action: Omit<IPortMeta, 'raw'>): ReducerReturnType => {
    const port = flow.raw.nodes[action.nodeId][action.io][action.index];
    flow.set(
      'selectedPort',
      makePortMeta({
        nodeId: action.nodeId,
        io: action.io,
        index: action.index,
        raw: port,
      })
    );
  },
  unselectPort: (flow: FlowState, action: {} = {}): ReducerReturnType => {
    flow.set('selectedPort', undefined);
  },
  setTargetPort: (flow: FlowState, action: Omit<IPortMeta, 'raw'>): ReducerReturnType => {
    const port = flow.raw.nodes[action.nodeId][action.io][action.index];
    flow.set(
      'targetPort',
      makePortMeta({
        nodeId: action.nodeId,
        io: action.io,
        index: action.index,
        raw: port,
      })
    );
  },
  unsetTargetPort: (flow: FlowState, action: {} = {}): ReducerReturnType => {
    flow.set('targetPort', undefined);
  },
  addEdge: (
    flow: FlowState,
    action: { startPort: IPortMeta; endPort: IPortMeta; id?: string },
    style: CanvasStyle
  ): ReducerReturnType => {
    const { startPort, endPort } = action;

    if (
      style.onEdgeAdded &&
      !style.onEdgeAdded(startPort, endPort, flow.inputPortEdgeMap, flow.outputPortEdgeMap)
    )
      return;

    const edgeId = action.id ?? style.generateEdgeId(startPort, endPort, flow);
    const startNode = flow.raw.nodes[startPort.nodeId];
    const endNode = flow.raw.nodes[endPort.nodeId];

    const edge = {
      start: {
        nodeId: startPort.nodeId,
        portName: startNode.output[startPort.index].name,
      },
      end: {
        nodeId: endPort.nodeId,
        portName: endNode.input[endPort.index].name,
      },
    };

    flow.raw.edges[edgeId] = edge;
    flow.setIn(['raw', 'edges', edgeId], edge);
    updateStateForEdge(flow, edgeId, edge);
    flow.update('visibleEdgeIds', u => u.add(edgeId));

    return {
      action: { type: 'addEdge', ...action, id: edgeId },
      undoFn: undoFlow => {
        reducers.deleteEdge(undoFlow, { id: edgeId });
      },
    };
  },
  deleteEdge: (flow: FlowState, action: { id: string }): ReducerReturnType => {
    const { id } = action;
    const edge = flow.raw.edges[id];
    if (edge) {
      const startPortIndex = flow.outputPortMap.get(edge.start.nodeId)!.get(edge.start.portName)!;
      const startPort: IPortMeta = {
        nodeId: edge.start.nodeId,
        io: 'output',
        index: startPortIndex,
        raw: flow.raw.nodes[edge.start.nodeId].output[startPortIndex],
      };
      const endPortIndex = flow.inputPortMap.get(edge.end.nodeId)!.get(edge.end.portName)!;
      const endPort: IPortMeta = {
        nodeId: edge.end.nodeId,
        io: 'input',
        index: endPortIndex,
        raw: flow.raw.nodes[edge.end.nodeId].input[endPortIndex],
      };

      removeStateForEdge(flow, id, edge);
      flow.deleteIn(['raw', 'edges', id]);

      return {
        action: { type: 'deleteEdge', ...action },
        undoFn: (undoFlow, style) => {
          reducers.addEdge(undoFlow, { id, startPort, endPort }, style);
        },
      };
    }
  },
  addNode: (
    flow: FlowState,
    action: { id?: string; node: Node },
    style: CanvasStyle
  ): ReducerReturnType => {
    const { node } = action;
    if (style.onNodeAdded && !style.onNodeAdded(node, flow)) return;

    const nodeId = action.id || style.generateNodeId(node, flow);

    flow.setIn(['raw', 'nodes', nodeId], node);
    updateStateForNode(flow, nodeId, node);
    flow.update('visibleNodeIds', u => u.add(nodeId));

    return {
      action: { type: 'addNode', ...action, id: nodeId },
      undoFn: (undoFlow, style) => {
        reducers.deleteNode(undoFlow, { id: nodeId });
      },
    };
  },
  deleteNode: (flow: FlowState, action: { id: string }): ReducerReturnType => {
    const { id } = action;
    const node = flow.raw.nodes[id];
    if (node) {
      const edgeIds = Array.from(flow.nodeEdgeMap.get(id)!.keys());
      const undoDeleteEdges = edgeIds.map(edgeId => reducers.deleteEdge(flow, { id: edgeId }));
      removeStateForNode(flow, id, node);
      flow.deleteIn(['raw', 'node', id]);

      return {
        action: { type: 'deleteNode', ...action },
        undoFn: (undoFlow, style) => {
          reducers.addNode(undoFlow, { id, node }, style);
          undoDeleteEdges.forEach(o => o && o.undoFn(undoFlow, style));
        },
      };
    }
  },
  setDraftNode: (
    flow: FlowState,
    action: { node: Node },
    style: CanvasStyle
  ): ReducerReturnType => {
    reducers.addNode(flow, { id: 'draft', node: action.node }, style);
    reducers.setSelectNodes(flow, { ids: ['draft'] });
  },
  unsetDraftNode: (
    flow: FlowState,
    action: { cancel: boolean },
    style: CanvasStyle
  ): ReducerReturnType => {
    reducers.stopMovingNodes(flow, action);
    const draftNode = flow.raw.nodes['draft'];
    if (draftNode) {
      if (!action.cancel) {
        const nodeId = style.generateNodeId(draftNode, flow);
        reducers.addNode(flow, { id: nodeId, node: draftNode }, style);
        reducers.setSelectNodes(flow, { ids: [nodeId] });
      }
    }
    reducers.deleteNode(flow, { id: 'draft' });
  },
  moveDraftNode: (flow: FlowState, action: { offset: Basic.IOffset }): ReducerReturnType => {
    reducers.moveSelectedNodes(flow, action);
  },
  undo: (flow: FlowState, action: {}, style: CanvasStyle): ReducerReturnType => {
    const undoAction = flow.undoStack.last(null);
    if (undoAction) {
      flow.update('undoStack', u => u.pop());
      flow.update('redoStack', u => u.push(undoAction.action));
      undoAction.undoFn(flow, style);
    }
  },
  redo: (flow: FlowState, action: {}, style: CanvasStyle): ReducerReturnType => {
    const redoAction = flow.redoStack.last(null);
    if (redoAction) {
      flow.update('redoStack', u => u.pop());
      const undoAction = reducers[redoAction.type](flow, redoAction as any, style);
      flow.update('undoStack', u => u.push(undoAction as UndoAction));
    }
  },
};

export type FlowAction = valueof<
  { [K in keyof typeof reducers]: { type: K } & Parameters<typeof reducers[K]>[1] }
>;
export type FlowDispatch = Dispatch<FlowAction>;
export type FlowReducer = Reducer<FlowState, FlowAction>;

export const makeFlowReducer = (style: CanvasStyle): FlowReducer => {
  return (flow: FlowState, action: FlowAction) => {
    console.debug(action);

    return flow.withMutations(m => {
      const undoAction = reducers[action.type](m, action as any, style);
      if (undoAction) {
        m.update('undoStack', u =>
          u.withMutations(m2 => {
            m2.push(undoAction);
            if (m2.size > style.undoStackSize) m2.shift();
          })
        );
        m.update('redoStack', u => u.clear());
      }
    });
  };
};
