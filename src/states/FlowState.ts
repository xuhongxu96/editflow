import { Flow } from 'models/Flow';
import { QuadTree } from 'algorithms/quadtree';
import { Rect } from 'models/BasicTypes';

export interface FlowState {
    raw: Flow
    quadtree: QuadTree<string>;
    cachedViewBound: Rect;
    viewBound: Rect;
    visibleNodes: string[],
    selectedNodes: Set<string>,
}

export const EmptyFlowState: FlowState = {
    raw: {
        nodes: {},
        edges: {},
    },
    quadtree: new QuadTree(1024, 768),
    cachedViewBound: { x: 0, y: 0, w: 0, h: 0 },
    viewBound: { x: 0, y: 0, w: 0, h: 0 },
    visibleNodes: [],
    selectedNodes: new Set<string>(),
}

export const toState = (flow: Flow) => {
    let res: FlowState = {
        ...EmptyFlowState,
        raw: flow,
    };

    return res;
}