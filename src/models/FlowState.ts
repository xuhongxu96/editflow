import { Flow, Port } from 'models/Flow';
import { QuadTree } from 'algorithms/quadtree';
import { Rect, IPoint, makeRect } from 'models/BasicTypes';
import { Map, Set, List, Record, RecordOf } from 'immutable';
import { UndoAction, FlowAction } from 'reducers/FlowReducer';

type NodeId = string;
type EdgeId = string;
type PortName = string;

export interface IEdgeState {
  start: IPoint;
  end: IPoint;
}

export type EdgeState = RecordOf<IEdgeState>;
export const makeEdgeState = Record<IEdgeState>({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });

type PortIndexMap = Map<PortName, number>;

export interface IPortMeta {
  nodeId: NodeId;
  io: 'input' | 'output';
  index: number;
  raw: Port;
}
export type PortMeta = RecordOf<IPortMeta>;
export const makePortMeta = Record<IPortMeta>({
  nodeId: '',
  io: 'input',
  index: 0,
  raw: { name: '', type: '' },
});

export type NodePortEdgeMap = Map<NodeId, Map<PortName, Set<EdgeId>>>;

export interface IFlowState {
  raw: Flow;
  nodeIdQuadTree: QuadTree<NodeId>;

  draftNodeLayout: Map<NodeId, Rect>;

  clientRect: Rect;
  cachedViewBound: Rect;
  viewBound: Rect;
  nodeBound: Rect;

  scale: number;

  newlyVisibleNodeIds: List<NodeId>;
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

  undoStack: List<UndoAction>;
  redoStack: List<FlowAction>;
}

export type FlowState = RecordOf<IFlowState>;
export const makeFlowState = Record<IFlowState>({
  raw: {
    nodes: {},
    edges: {},
  },
  draftNodeLayout: Map(),
  nodeIdQuadTree: new QuadTree(1024, 768),
  clientRect: makeRect(),
  cachedViewBound: makeRect(),
  viewBound: makeRect(),
  nodeBound: makeRect(),
  scale: 1,
  newlyVisibleNodeIds: List(),
  visibleNodeIds: Set(),
  highlightedNodeIds: Set(),
  selectedNodeIds: Set(),
  hoveredNodeId: undefined,
  inputPortMap: Map(),
  outputPortMap: Map(),
  nodeEdgeMap: Map(),
  inputPortEdgeMap: Map(),
  outputPortEdgeMap: Map(),
  edgeStateMap: Map(),
  newlyVisibleEdgeIds: Set(),
  visibleEdgeIds: Set(),
  highlightedEdgeIds: Set(),
  selectedEdgeIds: Set(),
  selectedPort: undefined,
  targetPort: undefined,
  undoStack: List(),
  redoStack: List(),
});
