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
    const [clientSize, rootRef, setSizeChanged] = useClientSize([props.width, props.height]);
    const [flow, dispatch] = useImmerReducer(FlowReducer, props.flow);

    useEffect(() => {
        setSizeChanged();
    }, [props.width, props.height, setSizeChanged]);

    useEffect(() => {
        dispatch({ type: 'initQuadTree' });
    }, [dispatch]);

    useEffect(() => {
        dispatch({
            type: 'updateClientSize',
            clientSize: clientSize,
        });
    }, [clientSize, dispatch]);

    useEffect(() => {
        const timer = setTimeout(() => dispatch({ type: 'updateVisibleNodes' }), 5);
        return () => clearTimeout(timer);
    }, [flow.viewBound, dispatch]);

    const onWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
        const factor = 0.3;
        const delta = { x: factor * e.deltaX, y: factor * e.deltaY };
        dispatch({
            type: 'updateOffsetByDelta',
            delta: delta,
        });
        e.stopPropagation();
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
                <g transform={`translate(${-flow.viewBound.x},${-flow.viewBound.y})`}>

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