import React, { useCallback, useEffect, useMemo } from 'react';
import { useImmerReducer } from 'use-immer';
import { Node } from './Node';
import { FlowState } from '../states/FlowState';
import { FlowReducer } from '../reducers/FlowReducer';
import { useClientSize } from 'hooks/useClientSize';
import { FlowContext } from 'contexts/FlowContext';

export interface CanvasProps {
    width: string | number;
    height: string | number;
    readonly?: boolean;
    flow: FlowState;
}

export const Canvas: React.FC<CanvasProps> = (props) => {
    const [clientSize, rootRef] = useClientSize();
    const [flow, dispatch] = useImmerReducer(FlowReducer, props.flow);

    useEffect(() => {
        let timer = setTimeout(() => dispatch({
            type: 'initClippedNodes',
        }), 50);
        return () => clearTimeout(timer);
    }, [dispatch]);

    useEffect(() => {
        let timer = setTimeout(() => dispatch({
            type: 'updateVisibleNodes',
            clientSize: clientSize,
        }), 50);

        return () => clearTimeout(timer);
    }, [clientSize, flow.offset, flow.clippedNodes, dispatch]);

    const onWheel = useCallback(e => {
        const factor = 1;
        const delta = { x: factor * e.deltaX, y: factor * e.deltaY };
        dispatch({
            type: 'updateOffsetByDelta',
            delta: delta,
        });
    }, [dispatch]);

    return (
        <FlowContext.Provider value={{ flow, dispatch }}>
            <svg
                xmlns='http://www.w3.org/2000/svg'
                ref={rootRef}
                width={props.width}
                height={props.height}

                onWheel={onWheel}
            >
                <g transform={`translate(${-flow.offset.x},${-flow.offset.y})`}>

                    {useMemo(() => flow.visibleNodes.map(i => flow.raw.nodes[i])
                        .map(node =>
                            <Node
                                key={node.id}
                                {...node}
                                selected={false}
                            />
                        ), [flow.visibleNodes, flow.raw.nodes])}

                </g>

            </svg>
        </FlowContext.Provider>
    );
}