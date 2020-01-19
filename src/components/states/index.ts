import * as Flow from 'flow/Flow';
import { toMap, IndexKeySelector } from 'utils';

export interface IPortState extends Flow.Port {
    connected: boolean;
}

export interface INodeState extends Omit<Flow.Node, 'input' | 'output'> {
    input: Map<string, IPortState>;
    output: Map<string, IPortState>;
}

export interface IEdgeState extends Flow.Edge {
    id: string;
}

export interface IFlowState extends Omit<Flow.Flow, 'nodes' | 'edges'> {
    nodes: Map<string, INodeState>;
    edges: Map<string, IEdgeState>;

    selectedNodeId?: string;
}

export const toState = (flow: Flow.Flow) => {
    let connectedInputPorts = new Set<Flow.NodePort>();
    let connectedOutputPorts = new Set<Flow.NodePort>();

    for (let edge of flow.edges) {
        connectedOutputPorts.add(edge.start);
        connectedInputPorts.add(edge.end);
    }

    const toPortMap = (node: Flow.Node, connectedSet: Set<Flow.NodePort>) =>
        toMap(node.input, port => port.name, port => ({
            ...port,
            connected: connectedSet.has({ nodeId: node.id, portName: port.name }),
        }));

    let res: IFlowState = {
        nodes: toMap(flow.nodes, node => node.id, node => ({
            ...node,
            input: toPortMap(node, connectedInputPorts),
            output: toPortMap(node, connectedOutputPorts),
        })),
        edges: toMap(flow.edges, IndexKeySelector, (edge, i) => ({
            ...edge,
            id: i,
        })),
    };

    return res;
}