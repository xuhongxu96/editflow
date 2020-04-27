import { FlowState } from "states/FlowState";
import * as Basic from "models/BasicTypes";
import { valueof, expandRect, isContained, limitRect } from "utils";
import { Reducer } from "use-immer";
import { Draft } from "immer";
import { Dispatch } from "react";

type DraftFlow = Draft<FlowState>;

const reducers = {
    initQuadTree: (draft: DraftFlow, action: {}) => {
        Object.entries(draft.raw.nodes).forEach(([id, node]) => {
            draft.nodeIdQuadTree.insert(node.layout, id);
        });
    },
    setScale: (draft: DraftFlow, action: { scale: number }) => {
        draft.scale = action.scale;
    },
    setOffset: (draft: DraftFlow, action: { offset: Basic.Offset }) => {
        draft.viewBound.x = action.offset.x;
        draft.viewBound.y = action.offset.y;
        draft.viewBound = limitRect(draft.viewBound, draft.nodeIdQuadTree.getBound());
    },
    updateOffsetByDelta: (draft: DraftFlow, action: { delta: Basic.Offset }) => {
        draft.viewBound.x += action.delta.x;
        draft.viewBound.y += action.delta.y;
        draft.viewBound = limitRect(draft.viewBound, draft.nodeIdQuadTree.getBound());
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
        if (draft.selectedNodeIds.size > 0)
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
            draft.draftNodeLayout.set(id, {
                x: node.layout.x + action.offset.x,
                y: node.layout.y + action.offset.y,
                w: node.layout.w,
                h: node.layout.h,
            })
        });
    },
    stopMovingNodes: (draft: DraftFlow, action: { cancel: boolean }) => {
        if (!action.cancel) {
            draft.draftNodeLayout.forEach((layout, id) => {
                draft.nodeIdQuadTree.remove(draft.raw.nodes[id].layout, id);
                draft.raw.nodes[id].layout = layout;
                draft.nodeIdQuadTree.insert(layout, id);
            });
        }
        draft.draftNodeLayout.clear();
    },
};

export type FlowAction = valueof<{ [K in keyof typeof reducers]: { type: K } & Parameters<typeof reducers[K]>[1] }>;
export type FlowDispatch = Dispatch<FlowAction>;

export const FlowReducer: Reducer<FlowState, FlowAction> = (draft: Draft<FlowState>, action: FlowAction) => {
    return reducers[action.type](draft, action as any);
}