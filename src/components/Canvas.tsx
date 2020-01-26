import React, { useState, useCallback } from 'react';
import { Node } from './Node';
import { IFlowState, INodeState } from './states';
import { useEventListener, useMoving, Offset } from './hooks';
import { clone } from './states/transformers';
import { HandleBox, HandleDirection } from './HandleBox';

const MinNodeWidth = 100;
const MinNodeHeight = 40;

export interface CanvasProps {
    width: string | number;
    height: string | number;
    readonly?: boolean;

    flow: IFlowState;
}

export const Canvas: React.FC<CanvasProps> = (props) => {
    const [flow, setFlow] = useState<IFlowState>(props.flow);

    const selectedNode = flow.nodes.get(flow.selectedNodeId || "");

    const cancelSelectedNode = useCallback(() => {
        setFlow(flow => clone(flow).withSelectedNodeId(undefined));
    }, [setFlow]);
    useEventListener('mousedown', cancelSelectedNode);

    const [movingHandleDirection, setMovingHandleDirection] = useState<HandleDirection>();

    const onMovingNodeOffsetUpdated = useCallback((offset: Offset) => {
        setFlow(clone(flow).withNodeLayoutOffset(flow.selectedNodeId, offset));
    }, [flow, setFlow]);

    const [startMovingNode, cancelMovingNode, onMovingNode] = useMoving(onMovingNodeOffsetUpdated);

    const onMovingHandleOffsetUpdated = useCallback((offset: Offset) => {
        if (selectedNode && movingHandleDirection) {
            const getLayoutOffset = () => {
                switch (movingHandleDirection) {
                    case 'left-top':
                        return { x: offset.x, y: offset.y, width: -offset.x, height: -offset.y };
                    case 'left-middle':
                        return { x: offset.x, width: -offset.x };
                    case 'left-bottom':
                        return { x: offset.x, width: -offset.x, height: offset.y };
                    case 'right-top':
                        return { y: offset.y, width: offset.x, height: -offset.y };
                    case 'right-middle':
                        return { width: offset.x };
                    case 'right-bottom':
                        return { width: offset.x, height: offset.y };
                }
            };
            setFlow(flow => clone(flow).withNodeLayoutOffset(flow.selectedNodeId, getLayoutOffset()));
        }
    }, [selectedNode, movingHandleDirection, setFlow]);

    const [startMovingHandle, cancelMovingHandle, onMovingHandle] = useMoving(onMovingHandleOffsetUpdated);

    const onAllMoving = useCallback((e: React.MouseEvent) => {
        onMovingNode(e);
        onMovingHandle(e);
    }, [onMovingNode, onMovingHandle]);

    const cancelAllMoving = useCallback(() => {
        cancelMovingNode();
        cancelMovingHandle();
    }, [cancelMovingNode, cancelMovingHandle]);

    useEventListener('mouseup', cancelAllMoving);

    const onNodeMouseDown = useCallback((e, node: INodeState) => {
        setFlow(flow => clone(flow).withSelectedNodeId(node.id));
        startMovingNode({ x: e.pageX, y: e.pageY });
    }, [setFlow, startMovingNode]);

    const onHandleMouseDown = useCallback((e, direction) => {
        if (selectedNode === undefined) return;

        setMovingHandleDirection(direction);

        const getLimit = () => {
            switch (direction) {
                case 'left-top':
                    return {
                        x2: selectedNode.x + selectedNode.width - MinNodeWidth,
                        y2: selectedNode.y + selectedNode.height - MinNodeHeight,
                    };
                case 'left-middle':
                    return {
                        x2: selectedNode.x + selectedNode.width - MinNodeWidth,
                    };
                case 'left-bottom':
                    return {
                        x2: selectedNode.x + selectedNode.width - MinNodeWidth,
                        y1: selectedNode.y + MinNodeHeight,
                    };
                case 'right-top':
                    return {
                        x1: selectedNode.x + MinNodeWidth,
                        y2: selectedNode.y + selectedNode.height - MinNodeHeight,
                    };
                case 'right-middle':
                    return {
                        x1: selectedNode.x + MinNodeWidth,
                    };
                case 'right-bottom':
                    return {
                        x1: selectedNode.x + MinNodeWidth,
                        y1: selectedNode.y + MinNodeHeight,
                    };
            }
        };

        startMovingHandle({ x: e.pageX, y: e.pageY, }, getLimit());
    }, [selectedNode, startMovingHandle, setMovingHandleDirection]);

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width={props.width}
            height={props.height}
            onMouseMove={onAllMoving}
        >

            {Array.from(flow.nodes.values())
                .filter(o => o.id !== flow.selectedNodeId)
                .concat(selectedNode || []) // Move selected Node to topmost
                .map(node =>
                    <Node
                        key={node.id}
                        selected={flow.selectedNodeId === node.id}
                        onMouseDown={onNodeMouseDown}
                        {...node}
                    />
                )}

            {selectedNode &&
                <HandleBox
                    x={selectedNode.x}
                    y={selectedNode.y}
                    width={selectedNode.width}
                    height={selectedNode.height}
                    onHandleMouseDown={onHandleMouseDown}
                />
            }
        </svg>
    );
}