export interface Port {
    name: string;
    type: string;
}

export interface Node {
    id: string;

    x: number;
    y: number;
    width: number;
    height: number;

    title: string;

    input: Port[];
    output: Port[];
}

export interface NodePort {
    nodeId: string;
    portName: string;
}

export interface Edge {
    start: NodePort;
    end: NodePort;
}

export interface Flow {
    nodes: Node[];
    edges: Edge[];
}