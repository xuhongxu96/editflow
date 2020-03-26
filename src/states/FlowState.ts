import { Port, Node, NodePort, Edge, Flow } from 'models/Flow';
import { toMap, IndexKeySelector } from 'utils';

export interface PortState extends Port {
    connected: boolean;
}

export interface NodeState extends Omit<Node, 'input' | 'output'> {
    input: Map<string, PortState>;
    output: Map<string, PortState>;
}

export interface EdgeState extends Edge {
    id: string;
}

export interface FlowState extends Omit<Flow, 'nodes' | 'edges'> {
    nodes: Map<string, NodeState>;
    edges: Map<string, EdgeState>;

    selectedNodeId?: string;

    offset: { x: number, y: number };
}

export const EmptyFlowState: FlowState = {
    nodes: new Map<string, NodeState>(),
    edges: new Map<string, EdgeState>(),
    offset: { x: 0, y: 0 },
}

export const toState = (flow: Flow) => {
    let connectedInputPorts = new Set<NodePort>();
    let connectedOutputPorts = new Set<NodePort>();

    for (let edge of flow.edges) {
        connectedOutputPorts.add(edge.start);
        connectedInputPorts.add(edge.end);
    }

    const toPortMap = (nodeId: string, ports: Port[], connectedSet: Set<NodePort>) =>
        toMap(ports, port => port.name, port => ({
            ...port,
            connected: connectedSet.has({ nodeId: nodeId, portName: port.name }),
        }));

    let res: FlowState = {
        nodes: toMap(flow.nodes, node => node.id, node => ({
            ...node,
            input: toPortMap(node.id, node.input, connectedInputPorts),
            output: toPortMap(node.id, node.output, connectedOutputPorts),
        })),
        edges: toMap(flow.edges, IndexKeySelector, (edge, i) => ({
            ...edge,
            id: i,
        })),
        offset: { x: 0, y: 0 },
    };

    return res;
}