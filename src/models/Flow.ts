import { Point, Size, Rect } from "./BasicTypes";

export interface Port {
    type: string;
}

export type PortMap = { [name: string]: Port };

export interface Node {
    layout: Rect;

    title: string;

    input: PortMap;
    output: PortMap;
}

export interface NodePort {
    nodeId: string;
    portName: string;
}

export interface Edge {
    start: NodePort;
    end: NodePort;
}

export type NodeMap = { [nodeId: string]: Node };
export type EdgeMap = { [edgeId: string]: Edge };

export interface Flow {
    nodes: NodeMap;
    edges: EdgeMap;
}