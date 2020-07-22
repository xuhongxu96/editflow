import { Size } from "models/BasicTypes";
import { PortMeta, NodePortEdgeMap, FlowState } from "models/FlowState";
import { Node } from "models/Flow";

export interface CanvasStyle {
    margin: number;
    defaultNodeSize: Size;
    minNodeSize: Size;
    generateNodeId: (node: Node, flow: FlowState) => string;
    generateEdgeId: (startPort: PortMeta, endPort: PortMeta, flow: FlowState) => string;
    onNodeAdded?: (node: Node, flow: FlowState) => boolean;
    onEdgeAdded?: (startPort: PortMeta, endPort: PortMeta, inputPortEdgeMap: NodePortEdgeMap, outputPortEdgeMap: NodePortEdgeMap) => boolean;
}

export const DefaultCanvasStyle: CanvasStyle = {
    margin: 32,
    defaultNodeSize: {
        w: 120,
        h: 40,
    },
    minNodeSize: {
        w: 60,
        h: 20,
    },
    generateNodeId: (_, flow) => `node-${Object.keys(flow.raw.nodes).length}`,
    generateEdgeId: (startPort, endPort) => `${startPort.nodeId}.${startPort.index}-${endPort.nodeId}.${endPort.index}`,
    onNodeAdded: () => true,
    onEdgeAdded: (startPort, endPort, inputPortEdgeMap) => {
        return startPort.io === 'output' &&
            endPort.io === 'input' &&
            startPort.raw.type === endPort.raw.type &&
            startPort.nodeId !== endPort.nodeId &&
            inputPortEdgeMap.get(endPort.nodeId)!.get(endPort.raw.name)!.size === 0;
    },
}