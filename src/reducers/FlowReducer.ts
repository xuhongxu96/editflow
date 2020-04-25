import { FlowState } from "states/FlowState";
import * as Basic from "models/BasicTypes";
import { valueof, expandRect } from "utils";
import { Reducer } from "use-immer";
import { Draft } from "immer";
import { Dispatch } from "react";

type DraftFlow = Draft<FlowState>;

const reducers = {
    initQuadTree: (draft: DraftFlow, action: {}) => {
        Object.entries(draft.raw.nodes).forEach(([id, node]) => {
            draft.quadtree.insert({ x: node.x, y: node.y, w: node.w, h: node.h }, id);
        });
    },
    updateClientSize: (draft: DraftFlow, action: { clientSize: Basic.Size }) => {
        draft.viewBound.w = action.clientSize.w;
        draft.viewBound.h = action.clientSize.h;
    },
    updateVisibleNodes: (draft: DraftFlow, action: {}) => {
        const view = expandRect(draft.viewBound, 200);
        draft.visibleNodes = draft.quadtree.getCoveredData(view).sort();
    },
    updateOffsetByDelta: (draft: DraftFlow, action: { delta: Basic.Offset }) => {
        draft.viewBound.x += action.delta.x;
        draft.viewBound.y += action.delta.y;
        if (draft.viewBound.x < 0) draft.viewBound.x = 0;
        if (draft.viewBound.y < 0) draft.viewBound.y = 0;
    },
    setSelectNodes: (draft: DraftFlow, action: { ids: string[] }) => {
        draft.selectedNodes.clear();
        reducers.addSelectNodes(draft, action);
    },
    addSelectNodes: (draft: DraftFlow, action: { ids: string[] }) => {
        action.ids.forEach(id => draft.selectedNodes.add(id));
    },
    unselectNodes: (draft: DraftFlow, action: { ids: string[] }) => {
        action.ids.forEach(id => draft.selectedNodes.delete(id));
    },
    unselectAllNodes: (draft: DraftFlow, action: {}) => {
        if (draft.selectedNodes.size > 0)
            draft.selectedNodes.clear();
    },
    toggleNodes: (draft: DraftFlow, action: { ids: string[] }) => {
        action.ids.forEach(id => {
            if (draft.selectedNodes.has(id)) {
                draft.selectedNodes.delete(id);
            } else {
                draft.selectedNodes.add(id);
            }
        })
    }
};

export type FlowAction = valueof<{ [K in keyof typeof reducers]: { type: K } & Parameters<typeof reducers[K]>[1] }>;
export type FlowDispatch = Dispatch<FlowAction>;

export const FlowReducer: Reducer<FlowState, FlowAction> = (draft: Draft<FlowState>, action: FlowAction) => {
    return reducers[action.type](draft, action as any);
}