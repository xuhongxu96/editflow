import { FlowState } from "states/FlowState";
import * as Basic from "models/BasicTypes";
import { valueof, expandRect, isContained, limitRect, expandRectToContain, getPortPosition, getPortDraftPosition } from "utils";
import { Reducer } from "use-immer";
import { Draft } from "immer";
import { Dispatch } from "react";
import { CanvasStyle } from "contexts/CanvasStyleContext";

type DraftFlow = Draft<FlowState>;

const reducers = {
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
    setSelectNodes: (draft: DraftFlow, action: { ids: string[] }) => {
        draft.selectedNodeIds.clear();
        reducers.addSelectNodes(draft, action);
    },
    addSelectNodes: (draft: DraftFlow, action: { ids: string[] }) => {
        action.ids.forEach(id => draft.selectedNodeIds.add(id));
    },
    unselectNodes: (draft: DraftFlow, action: { ids: string[] }) => {
        action.ids.forEach(id => draft.selectedNodeIds.delete(id));
    },
    unselectAllNodes: (draft: DraftFlow, action: {}) => {
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
    resizeSelectedNodes: (draft: DraftFlow, action: { offset: Basic.Offset }, style: CanvasStyle) => {
        draft.selectedNodeIds.forEach(id => {
            const node = draft.raw.nodes[id];
            const draftLayout = {
                x: node.layout.x,
                y: node.layout.y,
                w: Math.max(style.minNodeSize.w, node.layout.w + action.offset.x),
                h: Math.max(style.minNodeSize.h, node.layout.h + action.offset.y),
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
    }
};

export type FlowAction = valueof<{ [K in keyof typeof reducers]: { type: K } & Parameters<typeof reducers[K]>[1] }>;
export type FlowDispatch = Dispatch<FlowAction>;

export const makeFlowReducer = (style: CanvasStyle) => {
    return ((draft: Draft<FlowState>, action: FlowAction) => {
        return reducers[action.type](draft, action as any, style);
    }) as Reducer<FlowState, FlowAction>;
}