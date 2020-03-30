import { Flow } from 'models/Flow';

export interface FlowState {
    raw: Flow;
    offset: { x: number, y: number };
    clippedNodes: number[][][],
    visibleNodes: number[],
}

export const EmptyFlowState: FlowState = {
    raw: {
        nodes: [],
        edges: [],
    },
    offset: { x: 0, y: 0 },
    clippedNodes: [],
    visibleNodes: [],
}

export const toState = (flow: Flow) => {
    let res: FlowState = {
        ...EmptyFlowState,
        raw: flow,
    };

    return res;
}