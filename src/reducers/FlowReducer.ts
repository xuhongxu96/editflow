import { FlowState, PortMeta } from "models/FlowState";
import * as Basic from "models/BasicTypes";
import { valueof, expandRect, isContained, limitRect, expandRectToContain, getPortPosition, getPortDraftPosition, DecomposeHandleDirection } from "utils";
import { Reducer } from "use-immer";
import { Draft } from "immer";
import { Dispatch } from "react";
import { Flow, Node, Edge } from "models/Flow";
import { HandleDirection } from "components/HandleBox";
import { CanvasStyle } from "models/CanvasStyle";

type DraftFlow = Draft<FlowState>;

function updateStateForNode(draft: DraftFlow, id: string, node: Node) {
    draft.nodeIdQuadTree.insert(node.layout, id);

    draft.inputPortEdgeMap.set(id, new Map<string, Set<string>>());
    draft.outputPortEdgeMap.set(id, new Map<string, Set<string>>());

    draft.nodeBound = expandRectToContain(draft.nodeBound, node.layout);
    {
        const inputPortMap = new Map<string, number>();
        node.input.forEach((port, i) => {
            inputPortMap.set(port.name, i);
            draft.inputPortEdgeMap.get(id)?.set(port.name, new Set<string>());
        });
        draft.inputPortMap.set(id, inputPortMap);
    }
    {
        const outputPortMap = new Map<string, number>();
        node.output.forEach((port, i) => {
            outputPortMap.set(port.name, i);
            draft.outputPortEdgeMap.get(id)?.set(port.name, new Set<string>());
        });
        draft.outputPortMap.set(id, outputPortMap);
    }
    draft.nodeEdgeMap.set(id, new Set<string>());
}

function removeStateForNode(draft: DraftFlow, id: string, node: Node) {
    draft.nodeIdQuadTree.remove(node.layout, id);

    draft.inputPortEdgeMap.delete(id);
    draft.outputPortEdgeMap.delete(id);

    draft.inputPortMap.delete(id);
    draft.outputPortMap.delete(id);
    draft.nodeEdgeMap.delete(id);

    draft.visibleNodeIds.delete(id);
    draft.highlightedNodeIds.delete(id);
    draft.selectedNodeIds.delete(id);
    draft.newlyVisibleNodeIds = [];
    if (draft.hoveredNodeId === id) draft.hoveredNodeId = undefined;
}

function updateStateForEdge(draft: DraftFlow, id: string, edge: Edge) {
    const startNode = draft.raw.nodes[edge.start.nodeId];
    const endNode = draft.raw.nodes[edge.end.nodeId];

    const startPortIndex = draft.outputPortMap.get(edge.start.nodeId)?.get(edge.start.portName);
    const endPortIndex = draft.inputPortMap.get(edge.end.nodeId)?.get(edge.end.portName);

    draft.nodeEdgeMap.get(edge.start.nodeId)?.add(id);
    draft.nodeEdgeMap.get(edge.end.nodeId)?.add(id);

    draft.outputPortEdgeMap.get(edge.start.nodeId)!.get(edge.start.portName)!.add(id);
    draft.inputPortEdgeMap.get(edge.end.nodeId)!.get(edge.end.portName)!.add(id);

    draft.edgeStateMap.set(id, {
        start: getPortPosition(startNode, 'output', startPortIndex!),
        end: getPortPosition(endNode, 'input', endPortIndex!),
    });
}

const reducers = {
    init: (draft: DraftFlow, action: { flow: Flow }) => {
        const { flow } = action;

        draft.raw = flow;
        draft.draftNodeLayout.clear();
        draft.nodeIdQuadTree.clear();
        draft.cachedViewBound = draft.nodeBound = Basic.EmptyRect;
        draft.newlyVisibleNodeIds = [];
        draft.visibleNodeIds.clear();
        draft.selectedNodeIds.clear();
        draft.inputPortMap.clear();
        draft.outputPortMap.clear();
        draft.nodeEdgeMap.clear();
        draft.inputPortEdgeMap.clear();
        draft.outputPortEdgeMap.clear();
        draft.edgeStateMap.clear();
        draft.newlyVisibleEdgeIds.clear();
        draft.visibleEdgeIds.clear();
        draft.selectedEdgeIds.clear();

        Object.entries(flow.nodes).forEach(([id, node]) => {
            updateStateForNode(draft, id, node);
        });

        Object.entries(flow.edges).forEach(([id, edge]) => {
            updateStateForEdge(draft, id, edge);
        });

        reducers.updateVisibleNodes(draft, { cacheExpandSize: 500 });
    },
    setScale: (draft: DraftFlow, action: { scale: number }) => {
        draft.scale = action.scale;
    },
    setViewOffset: (draft: DraftFlow, action: { offset: Basic.Offset }, style: CanvasStyle) => {
        draft.viewBound.x = action.offset.x;
        draft.viewBound.y = action.offset.y;
        draft.viewBound = limitRect(draft.viewBound, expandRect(draft.nodeBound, style.margin, draft.scale));
    },
    updateViewOffsetByDelta: (draft: DraftFlow, action: { delta: Basic.Offset }, style: CanvasStyle) => {
        draft.viewBound.x += action.delta.x;
        draft.viewBound.y += action.delta.y;
        draft.viewBound = limitRect(draft.viewBound, expandRect(draft.nodeBound, style.margin, draft.scale));
    },
    updateClientSize: (draft: DraftFlow, action: { clientRect: Basic.Rect }) => {
        draft.clientRect = action.clientRect;
        draft.viewBound.w = action.clientRect.w;
        draft.viewBound.h = action.clientRect.h;
    },
    updateNewlyVisibleNodes: (draft: DraftFlow, action: {}) => {
        if (!isContained(draft.cachedViewBound, draft.viewBound)) {
            const viewBoundToCache = draft.viewBound;
            draft.newlyVisibleNodeIds = draft.nodeIdQuadTree.getCoveredData(viewBoundToCache)
                .filter(i => !draft.visibleNodeIds.has(i))
                .sort();
            draft.cachedViewBound = viewBoundToCache;
        }
    },
    updateVisibleNodes: (draft: DraftFlow, action: { cacheExpandSize: number }) => {
        const viewBoundToCache = expandRect(draft.viewBound, action.cacheExpandSize);
        draft.newlyVisibleNodeIds = [];
        draft.visibleNodeIds = new Set<string>(draft.nodeIdQuadTree.getCoveredData(viewBoundToCache));
        draft.cachedViewBound = viewBoundToCache;
    },
    updateNewlyVisibleEdges: (draft: DraftFlow, action: { nodeIds: string[] }) => {
        draft.newlyVisibleEdgeIds = action.nodeIds
            .reduce((p, nodeId) => { draft.nodeEdgeMap.get(nodeId)!.forEach(i => p.add(i)); return p; }, new Set<string>());
        draft.visibleEdgeIds.forEach(id => draft.newlyVisibleEdgeIds.delete(id));
    },
    updateVisibleEdges: (draft: DraftFlow, action: { nodeIds: string[] }) => {
        draft.newlyVisibleEdgeIds.clear();
        draft.visibleEdgeIds = action.nodeIds
            .reduce((p, nodeId) => { draft.nodeEdgeMap.get(nodeId)!.forEach(i => p.add(i)); return p; }, new Set<string>());
    },
    setHighlightedEdges: (draft: DraftFlow, action: { ids: string[] }) => {
        draft.highlightedEdgeIds = new Set<string>(action.ids);
    },
    setSelectEdges: (draft: DraftFlow, action: { ids: string[] }) => {
        draft.selectedEdgeIds = new Set<string>(action.ids);
    },
    addSelectEdges: (draft: DraftFlow, action: { ids: string[] }) => {
        action.ids.forEach(id => draft.selectedEdgeIds.add(id));
    },
    unselectAllEdges: (draft: DraftFlow, action: {} = {}) => {
        draft.selectedEdgeIds.clear();
    },
    setHoveredNode: (draft: DraftFlow, action: { id: string }) => {
        draft.hoveredNodeId = action.id;
    },
    unsetHoveredNode: (draft: DraftFlow, action: {} = {}) => {
        draft.hoveredNodeId = undefined;
    },
    setHighlightedNodes: (draft: DraftFlow, action: { ids: string[] }) => {
        draft.highlightedNodeIds = new Set<string>(action.ids);
    },
    setSelectNodes: (draft: DraftFlow, action: { ids: string[] }) => {
        draft.selectedNodeIds = new Set<string>(action.ids);
    },
    addSelectNodes: (draft: DraftFlow, action: { ids: string[] }) => {
        action.ids.forEach(id => draft.selectedNodeIds.add(id));
    },
    unselectNodes: (draft: DraftFlow, action: { ids: string[] }) => {
        action.ids.forEach(id => draft.selectedNodeIds.delete(id));
    },
    unselectAllNodes: (draft: DraftFlow, action: {} = {}) => {
        draft.selectedNodeIds.clear();
    },
    toggleNodes: (draft: DraftFlow, action: { ids: string[] }) => {
        action.ids.forEach(id => {
            if (draft.selectedNodeIds.has(id)) {
                draft.selectedNodeIds.delete(id);
            } else {
                draft.selectedNodeIds.add(id);
            }
        })
    },
    moveSelectedNodes: (draft: DraftFlow, action: { offset: Basic.Offset }) => {
        draft.selectedNodeIds.forEach(id => {
            const node = draft.raw.nodes[id];
            const draftLayout = {
                x: node.layout.x + action.offset.x,
                y: node.layout.y + action.offset.y,
                w: node.layout.w,
                h: node.layout.h,
            };
            draft.draftNodeLayout.set(id, draftLayout);
            reducers.updateEdgeStates(draft, { nodeId: id, draft: true });
        });
    },
    stopMovingNodes: (draft: DraftFlow, action: { cancel: boolean }) => {
        if (!action.cancel) {
            draft.draftNodeLayout.forEach((layout, id) => {
                draft.nodeIdQuadTree.remove(draft.raw.nodes[id].layout, id);
                draft.raw.nodes[id].layout = layout;
                draft.nodeIdQuadTree.insert(layout, id);
                draft.nodeBound = expandRectToContain(draft.nodeBound, layout);
                reducers.updateEdgeStates(draft, { nodeId: id });
            });
        }
        draft.draftNodeLayout.clear();
    },
    resizeSelectedNodes: (draft: DraftFlow, action: { direction: HandleDirection, offset: Basic.Offset }, style: CanvasStyle) => {
        const [hDirection, vDirection] = DecomposeHandleDirection(action.direction);

        draft.selectedNodeIds.forEach(id => {
            const node = draft.raw.nodes[id];
            const draftLayout = {
                x: hDirection === 'left'
                    ? Math.min(node.layout.x + action.offset.x, node.layout.x + node.layout.w - style.minNodeSize.w)
                    : node.layout.x,

                y: vDirection === 'top'
                    ? Math.min(node.layout.y + action.offset.y, node.layout.y + node.layout.h - style.minNodeSize.h)
                    : node.layout.y,

                w: hDirection === 'left'
                    ? Math.max(style.minNodeSize.w, node.layout.w - action.offset.x)
                    : Math.max(style.minNodeSize.w, node.layout.w + action.offset.x),

                h: vDirection === 'middle'
                    ? node.layout.h
                    : (vDirection === 'top'
                        ? Math.max(style.minNodeSize.h, node.layout.h - action.offset.y)
                        : Math.max(style.minNodeSize.h, node.layout.h + action.offset.y)),
            };
            draft.draftNodeLayout.set(id, draftLayout);
            reducers.updateEdgeStates(draft, { nodeId: id, draft: true });
        });
    },
    stopResizingNodes: (draft: DraftFlow, action: { cancel: boolean }) => {
        reducers.stopMovingNodes(draft, action);
    },
    updateEdgeStates: (draft: DraftFlow, action: { nodeId: string, draft?: boolean }) => {
        draft.nodeEdgeMap.get(action.nodeId)!.forEach(edgeId => {
            const edge = draft.raw.edges[edgeId];
            const startNode = draft.raw.nodes[edge.start.nodeId];
            const endNode = draft.raw.nodes[edge.end.nodeId];
            const startPortIndex = draft.outputPortMap.get(edge.start.nodeId)?.get(edge.start.portName)!;
            const endPortIndex = draft.inputPortMap.get(edge.end.nodeId)?.get(edge.end.portName)!;

            if (action.draft) {
                draft.edgeStateMap.set(edgeId, {
                    start: getPortDraftPosition(startNode, draft.draftNodeLayout.get(edge.start.nodeId) ?? startNode.layout, 'output', startPortIndex),
                    end: getPortDraftPosition(endNode, draft.draftNodeLayout.get(edge.end.nodeId) ?? endNode.layout, 'input', endPortIndex),
                });
            } else {
                draft.edgeStateMap.set(edgeId, {
                    start: getPortPosition(startNode, 'output', startPortIndex),
                    end: getPortPosition(endNode, 'input', endPortIndex),
                });
            }
        });
    },
    setSelectPort: (draft: DraftFlow, action: Omit<PortMeta, 'raw'>) => {
        const port = draft.raw.nodes[action.nodeId][action.io][action.index];
        draft.selectedPort = {
            nodeId: action.nodeId,
            io: action.io,
            index: action.index,
            raw: port,
        };
    },
    unselectPort: (draft: DraftFlow, action: {} = {}) => {
        draft.selectedPort = undefined;
    },
    setTargetPort: (draft: DraftFlow, action: Omit<PortMeta, 'raw'>) => {
        const port = draft.raw.nodes[action.nodeId][action.io][action.index];
        draft.targetPort = {
            nodeId: action.nodeId,
            io: action.io,
            index: action.index,
            raw: port,
        };
    },
    unsetTargetPort: (draft: DraftFlow, action: {} = {}) => {
        draft.targetPort = undefined;
    },
    addEdge: (draft: DraftFlow, action: { startPort: PortMeta, endPort: PortMeta }, style: CanvasStyle) => {
        const { startPort, endPort } = action;

        if (style.onEdgeAdded && !style.onEdgeAdded(startPort, endPort, draft.inputPortEdgeMap, draft.outputPortEdgeMap)) return;

        const edgeId = style.generateEdgeId(startPort, endPort, draft);
        const startNode = draft.raw.nodes[startPort.nodeId];
        const endNode = draft.raw.nodes[endPort.nodeId];

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

        draft.raw.edges[edgeId] = edge;
        updateStateForEdge(draft, edgeId, edge);

        draft.visibleEdgeIds.add(edgeId);
    },
    addNode: (draft: DraftFlow, action: { id?: string, node: Node }, style: CanvasStyle) => {
        const { node } = action;

        if (style.onNodeAdded && !style.onNodeAdded(node, draft)) return;

        const nodeId = action.id || style.generateNodeId(node, draft);

        draft.raw.nodes[nodeId] = node;
        updateStateForNode(draft, nodeId, node);

        draft.visibleNodeIds.add(nodeId);
    },
    deleteNode: (draft: DraftFlow, action: { id: string }) => {
        const { id } = action;
        const node = draft.raw.nodes[id];
        if (node) {
            removeStateForNode(draft, id, node);
            delete draft.raw.nodes[id];
        }
    },
    setDraftNode: (draft: DraftFlow, action: { node: Node }, style: CanvasStyle) => {
        reducers.addNode(draft, { id: 'draft', node: action.node }, style);
        reducers.setSelectNodes(draft, { ids: ['draft'] });
    },
    unsetDraftNode: (draft: DraftFlow, action: { cancel: boolean }, style: CanvasStyle) => {
        const draftNode = draft.raw.nodes['draft'];
        if (draftNode) {
            if (!action.cancel) {
                const nodeId = style.generateNodeId(draftNode, draft);
                reducers.addNode(draft, { id: nodeId, node: draftNode }, style);
                reducers.setSelectNodes(draft, { ids: [nodeId] });
            }
        }
        reducers.deleteNode(draft, { id: 'draft' });
    },
    moveDraftNode: (draft: DraftFlow, action: { offset: Basic.Offset }) => {
        reducers.moveSelectedNodes(draft, action);
    },
};

export type FlowAction = valueof<{ [K in keyof typeof reducers]: { type: K } & Parameters<typeof reducers[K]>[1] }>;
export type FlowDispatch = Dispatch<FlowAction>;
export type FlowReducer = Reducer<FlowState, FlowAction>;

export const makeFlowReducer = (style: CanvasStyle): FlowReducer => {
    return ((draft: Draft<FlowState>, action: FlowAction) => {
        return reducers[action.type](draft, action as any, style);
    });
}