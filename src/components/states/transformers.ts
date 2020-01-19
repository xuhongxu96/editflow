import { IFlowState, INodeState, IEdgeState } from ".";

export const clone = (flow: IFlowState) => {
    return new FlowState(Object.assign({}, flow));
}

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

    withNodePosition = (nodeId: string | undefined, pos: { x: number, y: number }) => {
        if (!nodeId) return this;

        const node = this.nodes.get(nodeId);
        if (node) {
            node.x = pos.x;
            node.y = pos.y;
        }
        return this;
    }

    withNodeOffset = (nodeId: string | undefined, offset: { x: number, y: number }) => {
        if (!nodeId) return this;

        const node = this.nodes.get(nodeId);
        if (node) {
            node.x += offset.x;
            node.y += offset.y;
        }
        return this;
    }
}
