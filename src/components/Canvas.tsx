import React, { useCallback, useEffect, useMemo, useContext } from 'react';
import { Node } from './Node';
import { useClientSize } from 'hooks/useClientSize';
import { FlowContext, FlowDispatchContext } from 'contexts/FlowContext';
import * as Flow from 'models/Flow';
import { useEventListener } from 'hooks';

export interface CanvasProps {
    width: string | number;
    height: string | number;
    readonly?: boolean;
}

export const Canvas: React.FC<CanvasProps> = (props) => {
    const flow = useContext(FlowContext);
    const dispatch = useContext(FlowDispatchContext);

    const [rootSize, rootRef, setRootSizeChanged] = useClientSize();

    useEffect(() => { setRootSizeChanged(); }, [props.width, props.height, setRootSizeChanged]);

    useEffect(() => {
        dispatch({ type: 'initQuadTree' });
    }, [dispatch]);

    useEffect(() => {
        dispatch({ type: 'updateClientSize', clientSize: rootSize });
    }, [rootSize, dispatch]);

    useEffect(() => {
        const timer = setTimeout(() => dispatch({ type: 'updateVisibleNodes' }), 5);
        return () => clearTimeout(timer);
    }, [flow.viewBound, dispatch]);

    useEventListener('mousedown', () => {
        dispatch({ type: 'unselectAllNodes' })
    });

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
        <svg
            xmlns='http://www.w3.org/2000/svg'
            ref={rootRef}
            width={props.width}
            height={props.height}

            onWheel={onWheel}
        >
            <g transform={`translate(${-flow.viewBound.x},${-flow.viewBound.y})`}>

                {useMemo(() => flow.visibleNodes.map(i => [i, flow.raw.nodes[i]] as [string, Flow.Node])
                    .map(([id, node]) =>
                        <Node
                            key={id}
                            id={id}
                            {...node}
                            selected={flow.selectedNodes.has(id)}
                        />
                    ), [flow.visibleNodes, flow.raw.nodes, flow.selectedNodes])}

            </g>

        </svg>
    );
}