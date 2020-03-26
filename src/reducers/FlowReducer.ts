import { FlowState } from "states/FlowState";
import * as Basic from "models/BasicTypes";
import { valueof } from "utils";
import { Reducer } from "react";

export const clone = (flow: FlowState) => {
    return Object.assign({}, flow);
}

const reducers = {
    updateOffsetByDelta: (state: FlowState, action: { type: 'updateOffsetByDelta', delta: Basic.Offset }) => {
        const { delta } = action;
        state.offset.x += delta.x;
        state.offset.y += delta.y;
        return state;
    },
    setSelectedNodeId: (state: FlowState, action: { type: 'setSelectedNodeId', nodeId?: string }) => {
        state.selectedNodeId = action.nodeId;
        return state;
    },
    setNodeLayout: (state: FlowState, action: { type: 'setNodeLayout', nodeId: string, layout: Partial<Basic.Rect> }) => {
        const { nodeId, layout } = action;

        const node = state.nodes.get(nodeId);
        if (node) {
            node.x = layout.x || node.x;
            node.y = layout.y || node.y;
            node.width = layout.w || node.width;
            node.height = layout.h || node.height;
        }
        return state;
    },
    updateNodeLayoutByOffset: (state: FlowState, action: {
        type: 'updateNodeLayoutByOffset', nodeId: string, offset: Partial<Basic.Rect>
    }) => {
        const { nodeId, offset } = action;

        const node = state.nodes.get(nodeId);
        if (node) {
            node.x += offset.x || 0;
            node.y += offset.y || 0;
            node.width += offset.w || 0;
            node.height += offset.h || 0;
        }
        return state;
    }
};

export type FlowAction = valueof<{ [K in keyof typeof reducers]: Parameters<typeof reducers[K]>[1] }>;

export const FlowReducer: Reducer<FlowState, FlowAction> = (state: FlowState, action: FlowAction) => {
    return reducers[action.type](clone(state), action as any);
}