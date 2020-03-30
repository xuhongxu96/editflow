import { FlowState } from "states/FlowState";
import * as Basic from "models/BasicTypes";
import { valueof, isIntersected, expandRect } from "utils";
import { Reducer } from "use-immer";
import { Draft, original } from "immer";
import { Dispatch } from "react";

const ClipWindowSize: Basic.Size = {
    w: 600,
    h: 600,
}

const reducers = {
    initClippedNodes: (draft: Draft<FlowState>, action: {}) => {
        draft.clippedNodes = draft.raw.nodes.reduce<number[][][]>(
            (r, v, i) => {
                const x2 = Math.trunc((v.x + v.w) / ClipWindowSize.w);
                const y2 = Math.trunc((v.y + v.h) / ClipWindowSize.h);

                if (r[x2] === undefined) r[x2] = [];
                if (r[x2][y2] === undefined) r[x2][y2] = [];

                r[x2][y2].push(i);

                return r;
            }, []);
    },
    updateVisibleNodes: (draft: Draft<FlowState>, action: { clientSize: Basic.Size }) => {
        const view = expandRect({ ...draft.offset, ...action.clientSize }, 300);
        const edge = {
            minCol: Math.trunc(view.x / ClipWindowSize.w),
            minRow: Math.trunc(view.y / ClipWindowSize.h),
            maxCol: Math.trunc((view.x + view.w) / ClipWindowSize.w) + 1,
            maxRow: Math.trunc((view.y + view.h) / ClipWindowSize.h) + 1,
        };

        const filterVisibleNodeIds = (nodeIds: number[]) => {
            if (!nodeIds) return [];
            return nodeIds.map(o => ({ node: draft.raw.nodes[o], i: o }))
                .filter(o => isIntersected(
                    {
                        x: o.node.x,
                        y: o.node.y,
                        w: o.node.w, h: o.node.h
                    },
                    view))
                .map(o => o.i);
        };

        const clippedNodes = original(draft.clippedNodes) || [];
        draft.visibleNodes = [];

        for (let row = edge.minRow; row <= edge.maxRow; ++row) {
            const minCol = clippedNodes[edge.minCol];
            if (minCol) draft.visibleNodes.push(...filterVisibleNodeIds(minCol[row]));

            const maxCol = clippedNodes[edge.maxCol];
            if (maxCol) draft.visibleNodes.push(...filterVisibleNodeIds(maxCol[row]));
        }

        for (let col = edge.minCol + 1; col < edge.maxCol; ++col) {
            const colNodes = clippedNodes[col];
            if (colNodes) {
                draft.visibleNodes.push(...filterVisibleNodeIds(colNodes[edge.minRow]));
                draft.visibleNodes.push(...filterVisibleNodeIds(colNodes[edge.maxRow]));
            }
        }

        for (let col = edge.minCol + 1; col < edge.maxCol; ++col) {
            for (let row = edge.minRow + 1; row < edge.maxRow; ++row) {
                const colNodes = clippedNodes[col];
                if (colNodes && colNodes[row]) draft.visibleNodes.push(...colNodes[row]);
            }
        }
    },
    updateOffsetByDelta: (draft: Draft<FlowState>, action: { delta: Basic.Offset }) => {
        draft.offset.x += action.delta.x;
        draft.offset.y += action.delta.y;
        if (draft.offset.x < 0) draft.offset.x = 0;
        if (draft.offset.y < 0) draft.offset.y = 0;
    },
};

export type FlowAction = valueof<{ [K in keyof typeof reducers]: { type: K } & Parameters<typeof reducers[K]>[1] }>;
export type FlowDispatch = Dispatch<FlowAction>;

export const FlowReducer: Reducer<FlowState, FlowAction> = (draft: Draft<FlowState>, action: FlowAction) => {
    return reducers[action.type](draft, action as any);
}