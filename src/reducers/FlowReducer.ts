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
  return flow.withMutations(m => {
    m.update('nodeIdQuadTree', u => u.insert(node.layout, id));
    m.set('nodeBound', Basic.makeRect(expandRectToContain(flow.nodeBound, node.layout)));
    {
      const inputPortMap = Map<string, number>().asMutable();
      const inputPortEdgeMap = (
        flow.inputPortEdgeMap.get(id) ?? Map<string, Set<string>>()
      ).asMutable();
      node.input.forEach((port, i) => {
        inputPortMap.set(port.name, i);
        inputPortEdgeMap.set(port.name, Set<string>());
      });
      m.set('inputPortEdgeMap', flow.inputPortEdgeMap.set(id, inputPortEdgeMap.asImmutable()));
      m.set('inputPortMap', flow.inputPortMap.set(id, inputPortMap.asImmutable()));
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
      m.set('outputPortEdgeMap', flow.outputPortEdgeMap.set(id, outputPortEdgeMap.asImmutable()));
      m.set('outputPortMap', flow.outputPortMap.set(id, outputPortMap.asImmutable()));
    }
    m.set('nodeEdgeMap', flow.nodeEdgeMap.set(id, Set<string>()));
  });
}

function removeStateForNode(flow: FlowState, id: string, node: Node) {
  return flow.withMutations(m => {
    m.update('nodeIdQuadTree', u => u.remove(node.layout, id));

    m.set('inputPortEdgeMap', flow.inputPortEdgeMap.delete(id));
    m.set('outputPortEdgeMap', flow.outputPortEdgeMap.delete(id));

    m.set('inputPortMap', flow.inputPortMap.delete(id));
    m.set('outputPortMap', flow.outputPortMap.delete(id));
    m.set('nodeEdgeMap', flow.nodeEdgeMap.delete(id));

    m.set('visibleNodeIds', flow.visibleNodeIds.delete(id));
    m.set('highlightedNodeIds', flow.highlightedNodeIds.delete(id));
    m.set('selectedNodeIds', flow.selectedNodeIds.delete(id));
    m.set('newlyVisibleNodeIds', List<string>());
    if (flow.hoveredNodeId === id) m.set('hoveredNodeId', undefined);
  });
}

function updateStateForEdge(flow: FlowState, id: string, edge: Edge) {
  const startNode = flow.raw.nodes[edge.start.nodeId];
  const endNode = flow.raw.nodes[edge.end.nodeId];

  const startPortIndex = flow.outputPortMap.get(edge.start.nodeId)!.get(edge.start.portName);
  const endPortIndex = flow.inputPortMap.get(edge.end.nodeId)!.get(edge.end.portName);

  return flow.withMutations(m => {
    m.set(
      'nodeEdgeMap',
      flow.nodeEdgeMap.withMutations(m => {
        m.update(edge.start.nodeId, u => u.add(id)).update(edge.end.nodeId, u => u.add(id));
      })
    );

    m.set(
      'outputPortEdgeMap',
      flow.outputPortEdgeMap.updateIn([edge.start.nodeId, edge.start.portName], u => u?.add(id))
    );
    m.set(
      'inputPortEdgeMap',
      flow.inputPortEdgeMap.updateIn([edge.end.nodeId, edge.end.portName], u => u?.add(id))
    );

    m.set(
      'edgeStateMap',
      flow.edgeStateMap.set(
        id,
        makeEdgeState({
          start: getPortPosition(startNode, 'output', startPortIndex!),
          end: getPortPosition(endNode, 'input', endPortIndex!),
        })
      )
    );
  });
}

function removeStateForEdge(flow: FlowState, id: string, edge: Edge) {
  return flow.withMutations(m => {
    m.set(
      'nodeEdgeMap',
      flow.nodeEdgeMap.withMutations(m2 => {
        m2.update(edge.start.nodeId, u => u.delete(id)).update(edge.end.nodeId, u => u.delete(id));
      })
    );

    m.set(
      'outputPortEdgeMap',
      flow.outputPortEdgeMap.updateIn([edge.start.nodeId, edge.start.portName], u => u.delete(id))
    );
    m.set(
      'inputPortEdgeMap',
      flow.inputPortEdgeMap.updateIn([edge.end.nodeId, edge.end.portName], u => u.delete(id))
    );

    m.set('edgeStateMap', flow.edgeStateMap.delete(id));

    m.set('visibleEdgeIds', flow.visibleEdgeIds.delete(id));
    m.set('highlightedEdgeIds', flow.highlightedEdgeIds.delete(id));
    m.set('selectedEdgeIds', flow.selectedEdgeIds.delete(id));
    m.set('newlyVisibleEdgeIds', flow.newlyVisibleEdgeIds.delete(id));
  });
}

const reducers = {
  init: (flow: FlowState, action: { flow: Flow }): FlowState => {
    return flow.withMutations(m => {
      m.update('nodeIdQuadTree', u => u.clear());

      m.set('raw', action.flow)
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
        updateStateForNode(m, id, node);
      });

      Object.entries(action.flow.edges).forEach(([id, edge]) => {
        updateStateForEdge(m, id, edge);
      });

      reducers.updateVisibleNodes(m, { cacheExpandSize: 500 });
    });
  },
  setScale: (flow: FlowState, action: { scale: number }): FlowState => {
    return flow.set('scale', action.scale);
  },
  setViewOffset: (
    flow: FlowState,
    action: { offset: Basic.IOffset },
    style: CanvasStyle
  ): FlowState => {
    return flow.set(
      'viewBound',
      Basic.makeRect(
        limitRect(
          { ...flow.viewBound, ...action.offset },
          expandRect(flow.nodeBound, style.margin, flow.scale)
        )
      )
    );
  },
  updateViewOffsetByDelta: (
    flow: FlowState,
    action: { delta: Basic.IOffset },
    style: CanvasStyle
  ): FlowState => {
    return flow.set(
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
  updateClientSize: (flow: FlowState, action: { clientRect: Basic.IRect }): FlowState => {
    return flow.withMutations(m => {
      m.set('clientRect', Basic.makeRect(action.clientRect))
        .setIn(['viewBound', 'w'], action.clientRect.w)
        .setIn(['viewBound', 'h'], action.clientRect.h);
    });
  },
  updateNewlyVisibleNodes: (flow: FlowState, action: {}): FlowState => {
    if (!isContained(flow.cachedViewBound, flow.viewBound)) {
      const viewBoundToCache = flow.viewBound;
      return flow.withMutations(m => {
        m.set(
          'newlyVisibleNodeIds',
          List(
            flow.nodeIdQuadTree
              .getCoveredData(viewBoundToCache)
              .filter(i => !flow.visibleNodeIds.has(i))
              .sort()
          )
        );
        m.set('cachedViewBound', viewBoundToCache);
      });
    }
    return flow;
  },
  updateVisibleNodes: (flow: FlowState, action: { cacheExpandSize: number }): FlowState => {
    const viewBoundToCache = expandRect(flow.viewBound, action.cacheExpandSize);
    return flow.withMutations(m => {
      m.set('newlyVisibleNodeIds', List())
        .set('visibleNodeIds', Set(flow.nodeIdQuadTree.getCoveredData(viewBoundToCache)))
        .set('cachedViewBound', Basic.makeRect(viewBoundToCache));
    });
  },
  updateNewlyVisibleEdges: (flow: FlowState, action: { nodeIds: string[] }): FlowState => {
    const newlyVisibleEdgeIds = action.nodeIds.reduce((p, nodeId) => {
      flow.nodeEdgeMap.get(nodeId)!.forEach(i => p.add(i));
      return p;
    }, Set<string>().asMutable());
    flow.visibleEdgeIds.forEach(id => newlyVisibleEdgeIds.delete(id));
    return flow.set('newlyVisibleEdgeIds', newlyVisibleEdgeIds.asImmutable());
  },
  updateVisibleEdges: (flow: FlowState, action: { nodeIds: string[] }): FlowState => {
    return flow.withMutations(m => {
      m.set('newlyVisibleEdgeIds', Set()).set(
        'visibleEdgeIds',
        action.nodeIds
          .reduce((p, nodeId) => {
            flow.nodeEdgeMap.get(nodeId)?.forEach(i => p.add(i));
            return p;
          }, Set<string>().asMutable())
          .asImmutable()
      );
    });
  },
  setHighlightedEdges: (flow: FlowState, action: { ids: string[] }): FlowState => {
    return flow.set('highlightedEdgeIds', Set(action.ids));
  },
  setSelectEdges: (flow: FlowState, action: { ids: string[] }): FlowState => {
    return flow.set('selectedEdgeIds', Set(action.ids));
  },
  addSelectEdges: (flow: FlowState, action: { ids: string[] }): FlowState => {
    return flow.update('selectedEdgeIds', u =>
      u.withMutations(m => {
        action.ids.forEach(id => m.add(id));
      })
    );
  },
  unselectAllEdges: (flow: FlowState, action: {} = {}): FlowState => {
    return flow.set('selectedEdgeIds', Set());
  },
  setHoveredNode: (flow: FlowState, action: { id: string }): FlowState => {
    return flow.set('hoveredNodeId', action.id);
  },
  unsetHoveredNode: (flow: FlowState, action: {} = {}): FlowState => {
    return flow.set('hoveredNodeId', undefined);
  },
  setHighlightedNodes: (flow: FlowState, action: { ids: string[] }): FlowState => {
    return flow.set('highlightedNodeIds', Set(action.ids));
  },
  setSelectNodes: (flow: FlowState, action: { ids: string[] }): FlowState => {
    return flow.set('selectedNodeIds', Set(action.ids));
  },
  addSelectNodes: (flow: FlowState, action: { ids: string[] }): FlowState => {
    return flow.update('selectedNodeIds', u =>
      u.withMutations(m => {
        action.ids.forEach(id => m.add(id));
      })
    );
  },
  unselectNodes: (flow: FlowState, action: { ids: string[] }): FlowState => {
    return flow.update('selectedNodeIds', u =>
      u.withMutations(m => {
        action.ids.forEach(id => m.delete(id));
      })
    );
  },
  unselectAllNodes: (flow: FlowState, action: {} = {}): FlowState => {
    return flow.set('selectedNodeIds', Set());
  },
  toggleNodes: (flow: FlowState, action: { ids: string[] }): FlowState => {
    return flow.update('selectedNodeIds', u =>
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
  moveSelectedNodes: (flow: FlowState, action: { offset: Basic.IOffset }): FlowState => {
    return flow.withMutations(m => {
      flow.selectedNodeIds.forEach(id => {
        const node = flow.raw.nodes[id];
        const draftLayout = {
          x: node.layout.x + action.offset.x,
          y: node.layout.y + action.offset.y,
          w: node.layout.w,
          h: node.layout.h,
        };
        m.update('draftNodeLayout', u => u.set(id, Basic.makeRect(draftLayout)));
        reducers.updateEdgeStates(m, { nodeId: id, draft: true });
      });
    });
  },
  stopMovingNodes: (flow: FlowState, action: { cancel: boolean }): FlowState => {
    return flow.withMutations(m => {
      if (!action.cancel) {
        flow.draftNodeLayout.forEach((layout, id) => {
          m.update('nodeIdQuadTree', u => u.remove(flow.raw.nodes[id].layout, id));
          m.raw.nodes[id].layout = layout;
          m.update('nodeIdQuadTree', u => u.insert(layout, id));
          m.set('nodeBound', Basic.makeRect(expandRectToContain(flow.nodeBound, layout)));
          reducers.updateEdgeStates(m, { nodeId: id });
        });
      }
      m.set('draftNodeLayout', Map());
    });
  },
  resizeSelectedNodes: (
    flow: FlowState,
    action: { direction: HandleDirection; offset: Basic.IOffset },
    style: CanvasStyle
  ): FlowState => {
    const [hDirection, vDirection] = DecomposeHandleDirection(action.direction);

    return flow.withMutations(m => {
      const draftNodeLayout = m.draftNodeLayout.asMutable();
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
        reducers.updateEdgeStates(m, { nodeId: id, draft: true });
      });
      m.set('draftNodeLayout', draftNodeLayout.asImmutable());
    });
  },
  stopResizingNodes: (flow: FlowState, action: { cancel: boolean }): FlowState => {
    return reducers.stopMovingNodes(flow, action);
  },
  updateEdgeStates: (flow: FlowState, action: { nodeId: string; draft?: boolean }): FlowState => {
    return flow.update('edgeStateMap', u =>
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
  setSelectPort: (flow: FlowState, action: Omit<IPortMeta, 'raw'>): FlowState => {
    const port = flow.raw.nodes[action.nodeId][action.io][action.index];
    return flow.set(
      'selectedPort',
      makePortMeta({
        nodeId: action.nodeId,
        io: action.io,
        index: action.index,
        raw: port,
      })
    );
  },
  unselectPort: (flow: FlowState, action: {} = {}): FlowState => {
    return flow.set('selectedPort', undefined);
  },
  setTargetPort: (flow: FlowState, action: Omit<IPortMeta, 'raw'>): FlowState => {
    const port = flow.raw.nodes[action.nodeId][action.io][action.index];
    return flow.set(
      'targetPort',
      makePortMeta({
        nodeId: action.nodeId,
        io: action.io,
        index: action.index,
        raw: port,
      })
    );
  },
  unsetTargetPort: (flow: FlowState, action: {} = {}): FlowState => {
    return flow.set('targetPort', undefined);
  },
  addEdge: (
    flow: FlowState,
    action: { startPort: IPortMeta; endPort: IPortMeta },
    style: CanvasStyle
  ): FlowState => {
    const { startPort, endPort } = action;

    if (
      style.onEdgeAdded &&
      !style.onEdgeAdded(startPort, endPort, flow.inputPortEdgeMap, flow.outputPortEdgeMap)
    )
      return flow;

    const edgeId = style.generateEdgeId(startPort, endPort, flow);
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

    return flow.withMutations(m => {
      m.raw.edges[edgeId] = edge;
      updateStateForEdge(m, edgeId, edge);
      m.update('visibleEdgeIds', u => u.add(edgeId));
    });
  },
  deleteEdge: (flow: FlowState, action: { id: string }): FlowState => {
    const { id } = action;
    const edge = flow.raw.edges[id];
    if (edge) {
      return flow.withMutations(m => {
        removeStateForEdge(m, id, edge);
        delete m.raw.edges[id];
      });
    }
    return flow;
  },
  addNode: (
    flow: FlowState,
    action: { id?: string; node: Node },
    style: CanvasStyle
  ): FlowState => {
    const { node } = action;
    if (style.onNodeAdded && !style.onNodeAdded(node, flow)) return flow;

    const nodeId = action.id || style.generateNodeId(node, flow);

    return flow.withMutations(m => {
      m.raw.nodes[nodeId] = node;
      updateStateForNode(m, nodeId, node);
      m.update('visibleNodeIds', u => u.add(nodeId));
    });
  },
  deleteNode: (flow: FlowState, action: { id: string }): FlowState => {
    const { id } = action;
    const node = flow.raw.nodes[id];
    if (node) {
      return flow.withMutations(m => {
        const edgeIds = flow.nodeEdgeMap.get(id)?.keys();
        if (edgeIds) {
          for (let edgeId of edgeIds) {
            reducers.deleteEdge(m, { id: edgeId });
          }
        }
        removeStateForNode(m, id, node);
        delete m.raw.nodes[id];
      });
    }
    return flow;
  },
  setDraftNode: (flow: FlowState, action: { node: Node }, style: CanvasStyle): FlowState => {
    return flow.withMutations(m => {
      reducers.addNode(m, { id: 'draft', node: action.node }, style);
      reducers.setSelectNodes(m, { ids: ['draft'] });
    });
  },
  unsetDraftNode: (flow: FlowState, action: { cancel: boolean }, style: CanvasStyle): FlowState => {
    const draftNode = flow.raw.nodes['draft'];
    if (draftNode) {
      if (!action.cancel) {
        const nodeId = style.generateNodeId(draftNode, flow);
        flow = flow.withMutations(m => {
          reducers.addNode(m, { id: nodeId, node: draftNode }, style);
          reducers.setSelectNodes(m, { ids: [nodeId] });
        });
      }
    }
    return reducers.deleteNode(flow, { id: 'draft' });
  },
  moveDraftNode: (draft: FlowState, action: { offset: Basic.IOffset }): FlowState => {
    return reducers.moveSelectedNodes(draft, action);
  },
};

export type FlowAction = valueof<
  { [K in keyof typeof reducers]: { type: K } & Parameters<typeof reducers[K]>[1] }
>;
export type FlowDispatch = Dispatch<FlowAction>;
export type FlowReducer = Reducer<FlowState, FlowAction>;

export const makeFlowReducer = (style: CanvasStyle): FlowReducer => {
  return (draft: FlowState, action: FlowAction) => {
    console.debug(action);
    return reducers[action.type](draft, action as any, style);
  };
};
