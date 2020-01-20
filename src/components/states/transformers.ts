import { IFlowState, INodeState, IEdgeState } from ".";

export const clone = (flow: IFlowState) => {
    return new FlowState(Object.assign({}, flow));
}

type Rect = { x?: number, y?: number, width?: number, height?: number };

class FlowState implements IFlowState {
    nodes: Map<string, INodeState>;
    edges: Map<string, IEdgeState>;
    selectedNodeId?: string | undefined;

    constructor(flow: IFlowState) {
        this.nodes = flow.nodes;
        this.edges = flow.edges;
        this.selectedNodeId = flow.selectedNodeId;
    }

    withSelectedNodeId = (nodeId: string | undefined) => {
        this.selectedNodeId = nodeId;
        return this;
    }

    withNodeLayout = (nodeId: string | undefined, pos: Rect) => {
        if (!nodeId) return this;

        const node = this.nodes.get(nodeId);
        if (node) {
            node.x = pos.x || node.x;
            node.y = pos.y || node.y;
            node.width = pos.width || node.width;
            node.height = pos.height || node.height;
        }
        return this;
    }

    withNodeLayoutOffset = (nodeId: string | undefined, offset: Rect) => {
        if (!nodeId) return this;

        const node = this.nodes.get(nodeId);
        if (node) {
            node.x += offset.x || 0;
            node.y += offset.y || 0;
            node.width += offset.width || 0;
            node.height += offset.height || 0;
        }
        return this;
    }
}
