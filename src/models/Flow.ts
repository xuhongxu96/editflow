import { IRect } from './BasicTypes';

export interface Port {
  name: string;
  type: string;
}

export interface Node {
  layout: IRect;

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

export type NodeMap = { [nodeId: string]: Node };
export type EdgeMap = { [edgeId: string]: Edge };

export interface Flow {
  nodes: NodeMap;
  edges: EdgeMap;
}
