import { FlowState, PortMeta } from "models/FlowState";
import * as Basic from "models/BasicTypes";
import { valueof, expandRect, isContained, limitRect, expandRectToContain, getPortPosition, getPortDraftPosition, DecomposeHandleDirection } from "utils";
import { Reducer } from "use-immer";
import { Draft } from "immer";
import { Dispatch } from "react";
import { CanvasStyle } from "contexts/CanvasStyleContext";
import { Flow } from "models/Flow";
import { HandleDirection } from "components/HandleBox";

type DraftFlow = Draft<FlowState>;

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
        draft.edgeStateMap.clear();
        draft.newlyVisibleEdgeIds.clear();
        draft.visibleEdgeIds.clear();
        draft.selectedEdgeIds.clear();

        Object.entries(flow.nodes).forEach(([id, node]) => {
            draft.nodeIdQuadTree.insert(node.layout, id);
            draft.nodeBound = expandRectToContain(draft.nodeBound, node.layout);
            {
                const inputPortMap = new Map<string, number>();
                node.input.forEach((port, i) => inputPortMap.set(port.name, i));
                draft.inputPortMap.set(id, inputPortMap);
            }
            {
                const outputPortMap = new Map<string, number>();
                node.output.forEach((port, i) => outputPortMap.set(port.name, i));
                draft.outputPortMap.set(id, outputPortMap);
            }
            draft.nodeEdgeMap.set(id, new Set<string>());
        });

        Object.entries(flow.edges).forEach(([id, edge]) => {
            const startNode = flow.nodes[edge.start.nodeId];
            const endNode = flow.nodes[edge.end.nodeId];

            const startPortIndex = draft.outputPortMap.get(edge.start.nodeId)?.get(edge.start.portName);
            const endPortIndex = draft.inputPortMap.get(edge.end.nodeId)?.get(edge.end.portName);

            draft.nodeEdgeMap.get(edge.start.nodeId)?.add(id);
            draft.nodeEdgeMap.get(edge.end.nodeId)?.add(id);

            draft.edgeStateMap.set(id, {
                start: getPortPosition(startNode, 'output', startPortIndex!),
                end: getPortPosition(endNode, 'input', endPortIndex!),
            });
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
    updateClientSize: (draft: DraftFlow, action: { clientSize: Basic.Size }) => {
        draft.viewBound.w = action.clientSize.w;
        draft.viewBound.h = action.clientSize.h;
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
    setSelectPort: (draft: DraftFlow, action: PortMeta) => {
        draft.selectedPort = {
            nodeId: action.nodeId,
            io: action.io,
            index: action.index,
            type: draft.raw.nodes[action.nodeId][action.io][action.index].type,
        };
    },
    unselectPort: (draft: DraftFlow, action: {} = {}) => {
        draft.selectedPort = undefined;
    },
    setTargetPort: (draft: DraftFlow, action: PortMeta) => {
        draft.targetPort = {
            nodeId: action.nodeId,
            io: action.io,
            index: action.index,
            type: draft.raw.nodes[action.nodeId][action.io][action.index].type,
        };
    },
    unsetTargetPort: (draft: DraftFlow, action: {} = {}) => {
        draft.targetPort = undefined;
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