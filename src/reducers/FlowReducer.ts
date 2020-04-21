import { FlowState } from "states/FlowState";
import * as Basic from "models/BasicTypes";
import { valueof, expandRect } from "utils";
import { Reducer } from "use-immer";
import { Draft } from "immer";
import { Dispatch } from "react";

const reducers = {
    initQuadTree: (draft: Draft<FlowState>, action: {}) => {
        draft.raw.nodes.forEach((node, i) => {
            draft.quadtree.insert({ x: node.x, y: node.y, w: node.w, h: node.h }, i);
        });
    },
    updateClientSize: (draft: Draft<FlowState>, action: { clientSize: Basic.Size }) => {
        draft.viewBound.w = action.clientSize.w;
        draft.viewBound.h = action.clientSize.h;
    },
    updateVisibleNodes: (draft: Draft<FlowState>, action: {}) => {
        const view = expandRect(draft.viewBound, 300);
        draft.visibleNodes = draft.quadtree.getCoveredData(view).sort();
    },
    updateOffsetByDelta: (draft: Draft<FlowState>, action: { delta: Basic.Offset }) => {
        draft.viewBound.x += action.delta.x;
        draft.viewBound.y += action.delta.y;
        if (draft.viewBound.x < 0) draft.viewBound.x = 0;
        if (draft.viewBound.y < 0) draft.viewBound.y = 0;
    },
};

export type FlowAction = valueof<{ [K in keyof typeof reducers]: { type: K } & Parameters<typeof reducers[K]>[1] }>;
export type FlowDispatch = Dispatch<FlowAction>;

export const FlowReducer: Reducer<FlowState, FlowAction> = (draft: Draft<FlowState>, action: FlowAction) => {
    return reducers[action.type](draft, action as any);
}