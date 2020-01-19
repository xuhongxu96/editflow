import React, { useState, useCallback } from 'react';
import { Node } from './Node';
import { IFlowState } from './states';
import { useEventListener } from './hook';
import { clone } from './states/transformers';
import { useMoving, Offset } from './hook/useMoving';

export interface CanvasProps {
    width: string | number;
    height: string | number;
    readonly?: boolean;

    flow: IFlowState;
}

export const Canvas: React.FC<CanvasProps> = (props) => {
    const [flow, setFlow] = useState<IFlowState>(props.flow);

    const onMovingNode = useCallback((offset: Offset) => {
        setFlow(clone(flow).withNodeOffset(flow.selectedNodeId, offset));
    }, [flow, setFlow]);

    const [startMoving, cancelMoving, onMoving] = useMoving(onMovingNode);
    useEventListener('mouseup', cancelMoving);

    const cancelSelectedNode = useCallback(() => {
        setFlow(clone(flow).withSelectedNodeId(undefined));
    }, [flow, setFlow]);
    useEventListener('mousedown', cancelSelectedNode);

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width={props.width}
            height={props.height}
            onMouseMove={onMoving}
            onMouseLeave={cancelMoving}
        >

            {Array.from(flow.nodes.values()).map(node =>
                <Node
                    key={node.id}
                    selected={flow.selectedNodeId === node.id}
                    onMouseDown={e => {
                        setFlow(clone(flow).withSelectedNodeId(node.id));
                        startMoving({ x: e.clientX, y: e.clientY });
                    }}
                    {...node}
                />
            )}

        </svg>
    );
}