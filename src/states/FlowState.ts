import { Flow } from 'models/Flow';
import { QuadTree } from 'algorithms/quadtree';
import { Rect, EmptyRect, Point } from 'models/BasicTypes';
import { expandRectToContain, getPortPosition } from 'utils';

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
    visibleNodeIds: new Set<string>(),
    selectedNodeIds: new Set<string>(),
    inputPortMap: new Map<NodeId, PortIndexMap>(),
    outputPortMap: new Map<NodeId, PortIndexMap>(),
    nodeEdgeMap: new Map<NodeId, Set<EdgeId>>(),
    edgeStateMap: new Map<EdgeId, EdgeState>(),
}

export const toState = (flow: Flow) => {
    let res: FlowState = {
        ...EmptyFlowState,
        raw: flow,
    };

    Object.entries(flow.nodes).forEach(([id, node]) => {
        res.nodeIdQuadTree.insert(node.layout, id);
        res.nodeBound = expandRectToContain(res.nodeBound, node.layout);
        {
            const inputPortMap = new Map<string, number>();
            node.input.forEach((port, i) => inputPortMap.set(port.name, i));
            res.inputPortMap.set(id, inputPortMap);
        }
        {
            const outputPortMap = new Map<string, number>();
            node.output.forEach((port, i) => outputPortMap.set(port.name, i));
            res.outputPortMap.set(id, outputPortMap);
        }
        res.nodeEdgeMap.set(id, new Set<EdgeId>());
    });

    Object.entries(flow.edges).forEach(([id, edge]) => {
        const startNode = flow.nodes[edge.start.nodeId];
        const endNode = flow.nodes[edge.end.nodeId];

        const startPortIndex = res.outputPortMap.get(edge.start.nodeId)?.get(edge.start.portName);
        const endPortIndex = res.inputPortMap.get(edge.end.nodeId)?.get(edge.end.portName);

        res.nodeEdgeMap.get(edge.start.nodeId)?.add(id);
        res.nodeEdgeMap.get(edge.end.nodeId)?.add(id);

        res.edgeStateMap.set(id, {
            start: getPortPosition(startNode, 'output', startPortIndex!),
            end: getPortPosition(endNode, 'input', endPortIndex!),
        });
    });

    return res;
}