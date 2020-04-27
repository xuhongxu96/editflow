import React, { useCallback, useEffect, useMemo, useContext } from 'react';
import { Node } from './Node';
import { useClientSize } from 'hooks/useClientSize';
import { FlowContext, FlowDispatchContext } from 'contexts/FlowContext';
import * as Flow from 'models/Flow';
import { useEventListener, useMoving } from 'hooks';
import { Offset } from 'models/BasicTypes';

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
        dispatch({ type: 'updateNewlyVisibleNodes' });
    }, [flow.viewBound, dispatch]);

    useEffect(() => {
        const timer = setTimeout(() => dispatch({ type: 'updateVisibleNodes', cacheExpandSize: 500 }), 500);
        return () => clearTimeout(timer);
    }, [flow.viewBound, dispatch]);

    useEventListener('mousedown', () => { dispatch({ type: 'unselectAllNodes' }) });

    const [startMovingNode, stopMovingNode, onMovingNode] = useMoving(useCallback((offset: Offset) => {
        dispatch({ type: 'moveSelectedNodes', offset: offset });
    }, [dispatch]));

    useEventListener('mouseup', useCallback(() => {
        stopMovingNode(false);
        dispatch({ type: 'stopMovingNodes', cancel: false });
    }, [stopMovingNode, dispatch]));

    useEventListener('keydown', useCallback((e) => {
        if (e.key === 'Escape') {
            stopMovingNode(true);
            dispatch({ type: 'stopMovingNodes', cancel: true });
        }
    }, [stopMovingNode, dispatch]))

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
            onMouseMove={e => { onMovingNode(e); }}
        >
            <g transform={`translate(${-flow.viewBound.x},${-flow.viewBound.y})`}>
                {useMemo(() => flow.newlyVisibleNodeIds
                    .filter(i => !flow.selectedNodeIds.has(i))
                    .map(i => [i, flow.raw.nodes[i]] as [string, Flow.Node])
                    .map(([id, node]) => {
                        return (<Node
                            key={id}
                            id={id}
                            {...node}
                            animated={true}
                            selected={flow.selectedNodeIds.has(id)}
                            onMouseDown={e => { startMovingNode(e); }}
                        />);
                    }
                    ), [flow.newlyVisibleNodeIds, flow.raw.nodes, flow.selectedNodeIds, startMovingNode])}

                {useMemo(() => Array.from(flow.visibleNodeIds.keys())
                    .filter(i => !flow.selectedNodeIds.has(i))
                    .map(i => [i, flow.raw.nodes[i]] as [string, Flow.Node])
                    .map(([id, node]) => {
                        return (<Node
                            key={id}
                            id={id}
                            {...node}
                            animated={false}
                            selected={flow.selectedNodeIds.has(id)}
                            onMouseDown={e => { startMovingNode(e); }}
                        />);
                    }), [flow.visibleNodeIds, flow.raw.nodes, flow.selectedNodeIds, startMovingNode])}

                {useMemo(() => Array.from(flow.selectedNodeIds.keys())
                    .map(i => [i, flow.raw.nodes[i]] as [string, Flow.Node])
                    .map(([id, node]) =>
                        <Node
                            key={id}
                            id={id}
                            {...node}
                            draftLayout={flow.draftNodeLayout.get(id)}
                            selected={flow.selectedNodeIds.has(id)}
                            onMouseDown={e => { startMovingNode(e); }}
                        />
                    ), [flow.raw.nodes, flow.selectedNodeIds, flow.draftNodeLayout, startMovingNode])}
            </g>
        </svg>
    );
}