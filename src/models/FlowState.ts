import { Flow, Port } from 'models/Flow';
import { QuadTree } from 'algorithms/quadtree';
import { Rect, EmptyRect, Point } from 'models/BasicTypes';

type NodeId = string;
type EdgeId = string;
type PortName = string;

export interface EdgeState {
  start: Point;
  end: Point;
}

type PortIndexMap = Map<PortName, number>;

export interface PortMeta {
  nodeId: NodeId;
  io: 'input' | 'output';
  index: number;
  raw: Port;
}

export type NodePortEdgeMap = Map<NodeId, Map<PortName, Set<EdgeId>>>;

export interface FlowState {
  raw: Flow;

  draftNodeLayout: Map<NodeId, Rect>;

  nodeIdQuadTree: QuadTree<NodeId>;

  clientRect: Rect;
  cachedViewBound: Rect;
  viewBound: Rect;
  nodeBound: Rect;

  scale: number;

  newlyVisibleNodeIds: NodeId[];
  visibleNodeIds: Set<NodeId>;
  highlightedNodeIds: Set<NodeId>;
  selectedNodeIds: Set<NodeId>;
  hoveredNodeId?: NodeId;

  inputPortMap: Map<NodeId, PortIndexMap>;
  outputPortMap: Map<NodeId, PortIndexMap>;

  nodeEdgeMap: Map<NodeId, Set<EdgeId>>;
  inputPortEdgeMap: NodePortEdgeMap;
  outputPortEdgeMap: NodePortEdgeMap;
  edgeStateMap: Map<EdgeId, EdgeState>;

  newlyVisibleEdgeIds: Set<EdgeId>;
  visibleEdgeIds: Set<EdgeId>;
  highlightedEdgeIds: Set<EdgeId>;
  selectedEdgeIds: Set<EdgeId>;

  selectedPort?: PortMeta;
  targetPort?: PortMeta;
}

export const EmptyFlowState: FlowState = {
  raw: {
    nodes: {},
    edges: {},
  },
  draftNodeLayout: new Map<NodeId, Rect>(),
  nodeIdQuadTree: new QuadTree(1024, 768),
  clientRect: EmptyRect,
  cachedViewBound: EmptyRect,
  viewBound: EmptyRect,
  nodeBound: EmptyRect,
  scale: 1,
  newlyVisibleNodeIds: [],
  visibleNodeIds: new Set<NodeId>(),
  highlightedNodeIds: new Set<NodeId>(),
  selectedNodeIds: new Set<NodeId>(),
  inputPortMap: new Map<NodeId, PortIndexMap>(),
  outputPortMap: new Map<NodeId, PortIndexMap>(),
  nodeEdgeMap: new Map<NodeId, Set<EdgeId>>(),
  inputPortEdgeMap: new Map<NodeId, Map<PortName, Set<EdgeId>>>(),
  outputPortEdgeMap: new Map<NodeId, Map<PortName, Set<EdgeId>>>(),
  edgeStateMap: new Map<EdgeId, EdgeState>(),
  newlyVisibleEdgeIds: new Set<EdgeId>(),
  visibleEdgeIds: new Set<EdgeId>(),
  highlightedEdgeIds: new Set<EdgeId>(),
  selectedEdgeIds: new Set<EdgeId>(),
};

export interface FlowStack {
  present: FlowState;
  update: FlowState;
  past: FlowState[];
  future: FlowState[];
}

export const EmptyFlowStack: FlowStack = {
  present: EmptyFlowState,
  update: EmptyFlowState,
  past: [],
  future: [],
};
