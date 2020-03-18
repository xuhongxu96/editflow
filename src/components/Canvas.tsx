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
    const [realSize, setRealSize] = useState<{ width: number, height: number }>({ width: 0, height: 0 });

    const [flow, setFlow] = useState<IFlowState>(props.flow);

    const calculateNodeWithRealPosition = (node?: INodeState) => {
        if (node === undefined) return undefined;
        return { node: node, x: node.x + flow.offset.x, y: node.y + flow.offset.y };
    };
    const selectedNode = calculateNodeWithRealPosition(flow.nodes.get(flow.selectedNodeId || ""));

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
                        x2: selectedNode.x + selectedNode.node.width - MinNodeWidth,
                        y2: selectedNode.x + selectedNode.node.height - MinNodeHeight,
                    };
                case 'left-middle':
                    return {
                        x2: selectedNode.x + selectedNode.node.width - MinNodeWidth,
                    };
                case 'left-bottom':
                    return {
                        x2: selectedNode.x + selectedNode.node.width - MinNodeWidth,
                        y1: selectedNode.y + MinNodeHeight,
                    };
                case 'right-top':
                    return {
                        x1: selectedNode.x + MinNodeWidth,
                        y2: selectedNode.y + selectedNode.node.height - MinNodeHeight,
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

    const rootSvg = useCallback(el => {
        if (el != null) {
            setRealSize({ width: el.clientWidth, height: el.clientHeight });
        }
    }, []);

    const onWheel = useCallback(e => {
        const factor = 1;
        const delta = { x: factor * e.deltaX, y: factor * e.deltaY };
        setFlow(flow => {
            return clone(flow).withOffset(delta);
        });
    }, [setFlow]);

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            ref={rootSvg}
            width={props.width}
            height={props.height}
            onMouseMove={onAllMoving}
            onWheel={onWheel}
        >

            {Array.from(flow.nodes.values())
                .filter(o => o.id !== flow.selectedNodeId)
                .map(o => calculateNodeWithRealPosition(o)!!)
                .filter(o => {
                    return o.x < realSize.width && o.y < realSize.height && o.x + o.node.width > 0 && o.y + o.node.height > 0;
                })
                .concat(selectedNode || []) // Move selected Node to topmost
                .map(o =>
                    <Node
                        key={o.node.id}
                        {...o.node}
                        selected={flow.selectedNodeId === o.node.id}
                        onMouseDown={onNodeMouseDown}
                        x={o.x}
                        y={o.y}
                    />
                )}

            {selectedNode &&
                <HandleBox
                    x={selectedNode.x}
                    y={selectedNode.y}
                    width={selectedNode.node.width}
                    height={selectedNode.node.height}
                    onHandleMouseDown={onHandleMouseDown}
                />
            }
        </svg>
    );
}