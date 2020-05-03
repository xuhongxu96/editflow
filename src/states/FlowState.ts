import { Flow } from 'models/Flow';
import { QuadTree } from 'algorithms/quadtree';
import { Rect, EmptyRect } from 'models/BasicTypes';

export interface FlowState {
    raw: Flow;

    draftNodeLayout: Map<string, Rect>;

    nodeIdQuadTree: QuadTree<string>;

    cachedViewBound: Rect;
    viewBound: Rect;
    nodeBound: Rect;

    scale: number;

    newlyVisibleNodeIds: string[];
    visibleNodeIds: Set<string>;

    selectedNodeIds: Set<string>;
}

export const EmptyFlowState: FlowState = {
    raw: {
        nodes: {},
        edges: {},
    },
    draftNodeLayout: new Map<string, Rect>(),
    nodeIdQuadTree: new QuadTree(1024, 768),
    cachedViewBound: EmptyRect,
    viewBound: EmptyRect,
    nodeBound: EmptyRect,
    scale: 1,
    newlyVisibleNodeIds: [],
    visibleNodeIds: new Set<string>(),
    selectedNodeIds: new Set<string>(),
}

export const toState = (flow: Flow) => {
    let res: FlowState = {
        ...EmptyFlowState,
        raw: flow,
    };

    return res;
}