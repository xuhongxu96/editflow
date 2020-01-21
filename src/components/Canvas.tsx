import React, { useState, useCallback } from 'react';
import { Node } from './Node';
import { IFlowState } from './states';
import { useEventListener } from './hook';
import { clone } from './states/transformers';
import { useMoving, Offset } from './hook/useMoving';
import { HandleBox, HandleDirection } from './HandleBox';

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
        setFlow(clone(flow).withSelectedNodeId(undefined));
    }, [flow, setFlow]);
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
            setFlow(clone(flow).withNodeLayoutOffset(flow.selectedNodeId, getLayoutOffset()));
        }
    }, [flow, selectedNode, movingHandleDirection, setFlow]);

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

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width={props.width}
            height={props.height}
            onMouseMove={onAllMoving}
        >

            {Array.from(flow.nodes.values())
                .filter(o => o.id !== flow.selectedNodeId)
                .concat(selectedNode || [])
                .map(node =>
                    <Node
                        key={node.id}
                        selected={flow.selectedNodeId === node.id}
                        onMouseDown={e => {
                            setFlow(clone(flow).withSelectedNodeId(node.id));
                            startMovingNode({ x: e.clientX, y: e.clientY });
                        }}
                        {...node}
                    />
                )}

            {selectedNode &&
                <HandleBox
                    x={selectedNode.x}
                    y={selectedNode.y}
                    width={selectedNode.width}
                    height={selectedNode.height}
                    onHandleMouseDown={(e, direction) => {
                        setMovingHandleDirection(direction);
                        startMovingHandle({ x: e.clientX, y: e.clientY });
                    }}
                />
            }
        </svg>
    );
}