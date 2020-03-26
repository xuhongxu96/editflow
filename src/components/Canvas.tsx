import React, { useState, useCallback, useReducer } from 'react';
import { Node } from './Node';
import { FlowState, NodeState } from '../states/FlowState';
import { useEventListener, useMoving, Offset } from '../hooks';
import { FlowReducer } from '../reducers/FlowReducer';
import { HandleBox, HandleDirection } from './HandleBox';
import { useClientSize } from 'hooks/useClientSize';
import { FlowContext } from 'contexts/FlowContext';
import { Rect } from 'models/BasicTypes';

const MinNodeWidth = 100;
const MinNodeHeight = 40;

export interface CanvasProps {
    width: string | number;
    height: string | number;
    readonly?: boolean;
    flow: FlowState;
}

export const Canvas: React.FC<CanvasProps> = (props) => {
    const [clientSize, rootRef] = useClientSize();
    const [flow, dispatch] = useReducer(FlowReducer, props.flow);

    const calculateNodeWithRealPosition = (node?: NodeState) => {
        if (node === undefined) return undefined;
        return { node: node, x: node.x + flow.offset.x, y: node.y + flow.offset.y };
    };
    const selectedNode = calculateNodeWithRealPosition(flow.nodes.get(flow.selectedNodeId || ""));

    const cancelSelectedNode = useCallback(() => {
        dispatch({
            type: 'setSelectedNodeId',
            nodeId: undefined,
        });
    }, []);
    useEventListener('mousedown', cancelSelectedNode);

    const [movingHandleDirection, setMovingHandleDirection] = useState<HandleDirection>();

    const onMovingNodeOffsetUpdated = useCallback((offset: Offset) => {
        if (flow.selectedNodeId) {
            dispatch({
                type: 'updateNodeLayoutByOffset',
                nodeId: flow.selectedNodeId,
                offset: offset,
            });
        }
    }, [flow.selectedNodeId]);

    const [startMovingNode, cancelMovingNode, onMovingNode] = useMoving(onMovingNodeOffsetUpdated);

    const onMovingHandleOffsetUpdated = useCallback((offset: Offset) => {
        if (selectedNode && movingHandleDirection) {
            const getLayoutOffset = (): Partial<Rect> => {
                switch (movingHandleDirection) {
                    case 'left-top':
                        return { x: offset.x, y: offset.y, w: -offset.x, h: -offset.y };
                    case 'left-middle':
                        return { x: offset.x, w: -offset.x };
                    case 'left-bottom':
                        return { x: offset.x, w: -offset.x, h: offset.y };
                    case 'right-top':
                        return { y: offset.y, w: offset.x, h: -offset.y };
                    case 'right-middle':
                        return { w: offset.x };
                    case 'right-bottom':
                        return { w: offset.x, h: offset.y };
                }
            };
            dispatch({
                type: 'updateNodeLayoutByOffset',
                nodeId: selectedNode.node.id,
                offset: getLayoutOffset(),
            });
        }
    }, [selectedNode, movingHandleDirection]);

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

    const onNodeMouseDown = useCallback((e, node: NodeState) => {
        dispatch({
            type: 'setSelectedNodeId',
            nodeId: node.id,
        });
        startMovingNode({ x: e.pageX, y: e.pageY });
    }, [startMovingNode]);

    const onHandleMouseDown = useCallback((e, direction) => {
        if (selectedNode === undefined) return;

        setMovingHandleDirection(direction);

        const getLimit = () => {
            switch (direction) {
                case 'left-top':
                    return {
                        x2: selectedNode.x + selectedNode.node.width - MinNodeWidth,
                        y2: selectedNode.y + selectedNode.node.height - MinNodeHeight,
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

    const onWheel = useCallback(e => {
        const factor = 1;
        const delta = { x: -factor * e.deltaX, y: -factor * e.deltaY };
        dispatch({
            type: 'updateOffsetByDelta',
            delta: delta,
        });
    }, []);

    return (
        <FlowContext.Provider value={flow}>
            <svg
                xmlns='http://www.w3.org/2000/svg'
                ref={rootRef}
                width={props.width}
                height={props.height}
                onMouseMove={onAllMoving}
                onWheel={onWheel}
            >

                {Array.from(flow.nodes.values())
                    .filter(o => o.id !== flow.selectedNodeId)
                    .map(o => calculateNodeWithRealPosition(o)!!)
                    .filter(o => {
                        return o.x < clientSize.w && o.y < clientSize.h && o.x + o.node.width > 0 && o.y + o.node.height > 0;
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
        </FlowContext.Provider>
    );
}