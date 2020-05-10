import { Flow } from 'models/Flow';
import { QuadTree } from 'algorithms/quadtree';
import { Rect, EmptyRect, Point } from 'models/BasicTypes';

type NodeId = string;
type EdgeId = string;
type PortName = string;


export interface EdgeState {
    start: Point,
    end: Point,
}

type PortIndexMap = Map<PortName, number>;

export interface FlowState {
    raw: Flow;

    draftNodeLayout: Map<NodeId, Rect>;

    nodeIdQuadTree: QuadTree<NodeId>;

    cachedViewBound: Rect;
    viewBound: Rect;
    nodeBound: Rect;

    scale: number;

    newlyVisibleNodeIds: NodeId[];
    visibleNodeIds: Set<NodeId>;

    selectedNodeIds: Set<NodeId>;

    inputPortMap: Map<NodeId, PortIndexMap>;
    outputPortMap: Map<NodeId, PortIndexMap>;

    nodeEdgeMap: Map<NodeId, Set<EdgeId>>;
    edgeStateMap: Map<EdgeId, EdgeState>;

    newlyVisibleEdgeIds: Set<EdgeId>,
    visibleEdgeIds: Set<EdgeId>;
    selectedEdgeIds: Set<EdgeId>;
}

export const EmptyFlowState: FlowState = {
    raw: {
        nodes: {},
        edges: {},
    },
    draftNodeLayout: new Map<NodeId, Rect>(),
    nodeIdQuadTree: new QuadTree(1024, 768),
    cachedViewBound: EmptyRect,
    viewBound: EmptyRect,
    nodeBound: EmptyRect,
    scale: 1,
    newlyVisibleNodeIds: [],
    visibleNodeIds: new Set<NodeId>(),
    selectedNodeIds: new Set<NodeId>(),
    inputPortMap: new Map<NodeId, PortIndexMap>(),
    outputPortMap: new Map<NodeId, PortIndexMap>(),
    nodeEdgeMap: new Map<NodeId, Set<EdgeId>>(),
    edgeStateMap: new Map<EdgeId, EdgeState>(),
    newlyVisibleEdgeIds: new Set<EdgeId>(),
    visibleEdgeIds: new Set<EdgeId>(),
    selectedEdgeIds: new Set<EdgeId>(),
};