import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { Node } from './Node';
import { useClientSize } from 'hooks/useClientSize';
import { useFlowDispatch, useFlow, useUpdateVisibleNodes, useUpdateViewOffsetByDelta, useMovingAndResizingNode, useSelectableNodeAndEdge } from 'contexts/FlowContext';
import * as Flow from 'models/Flow';
import { Edge } from './Edge';
import { EdgeState } from 'models/FlowState';
import { HandleDirection } from './HandleBox';

export interface CanvasProps {
    width: string | number;
    height: string | number;
    readonly?: boolean;
}

export const Canvas: React.FC<CanvasProps> = (props) => {
    const flow = useFlow();
    const dispatch = useFlowDispatch();

    const rootRef = useRef<SVGSVGElement>(null);
    const rootClientSize = useClientSize(rootRef, [props.width, props.height]);
    useEffect(() => dispatch({ type: 'updateClientSize', clientSize: rootClientSize }), [rootClientSize, dispatch]);

    useUpdateVisibleNodes();
    useSelectableNodeAndEdge();

    const { startMovingNode, onMovingNode, startResizingNode, onResizingNode } = useMovingAndResizingNode();
    const updateViewOffsetByDelta = useUpdateViewOffsetByDelta();

    useEffect(() => dispatch({ type: 'updateNewlyVisibleEdges', nodeIds: flow.newlyVisibleNodeIds }),
        [flow.newlyVisibleNodeIds, dispatch]);

    useEffect(() => dispatch({ type: 'updateVisibleEdges', nodeIds: Array.from(flow.visibleNodeIds.keys()) }),
        [flow.visibleNodeIds, dispatch]);

    const onNodeMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>, id: string) => {
        if (!flow.selectedNodeIds.has(id)) {
            if (e.ctrlKey) {
                dispatch({ type: 'addSelectNodes', ids: [id] });
            } else {
                dispatch({ type: 'setSelectNodes', ids: [id] });
            }
        }
        startMovingNode(e);
        e.stopPropagation();
    }, [flow.selectedNodeIds, startMovingNode, dispatch]);

    const onNodeClick = useCallback((e: React.MouseEvent<SVGSVGElement>, id: string) => {
        // No need to check if it is selected here, because when node is selected,
        // it will be moved from visibleNodes to selectedNodes, and the click event won't be triggered.
        if (e.ctrlKey) {
            dispatch({ type: 'unselectNodes', ids: [id] });
        }
    }, [dispatch]);

    const onNodeHandleMouseDown = useCallback((e: React.MouseEvent, id: string, direction: HandleDirection) =>
        startResizingNode(e, direction),
        [startResizingNode]);

    const newlyVisibleNodes = useMemo(() =>
        flow.newlyVisibleNodeIds
            .filter(i => !flow.selectedNodeIds.has(i))
            .map(i => [i, flow.raw.nodes[i]] as [string, Flow.Node]),
        [flow.newlyVisibleNodeIds, flow.selectedNodeIds, flow.raw.nodes]);

    const visibleNodes = useMemo(() =>
        Array.from(flow.visibleNodeIds.keys())
            .filter(i => !flow.selectedNodeIds.has(i))
            .map(i => [i, flow.raw.nodes[i]] as [string, Flow.Node]),
        [flow.visibleNodeIds, flow.selectedNodeIds, flow.raw.nodes]);

    const selectedNodes = useMemo(() =>
        Array.from(flow.selectedNodeIds.keys())
            .map(i => [i, flow.raw.nodes[i]] as [string, Flow.Node]),
        [flow.selectedNodeIds, flow.raw.nodes]);

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            ref={rootRef}
            width={props.width}
            height={props.height}
            onWheel={e => updateViewOffsetByDelta(e)}
            onMouseMove={e => { onMovingNode(e); onResizingNode(e); }}
        >
            <defs>
                <filter id="blur0" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
                </filter>
            </defs>

            <g transform={`scale(${flow.scale}) translate(${-flow.viewBound.x},${-flow.viewBound.y})`}>
                <g filter={flow.selectedNodeIds.size > 0 ? 'url(#blur0)' : ''}>
                    {useMemo(() => newlyVisibleNodes.map(([id, node]) => (
                        <Node
                            key={id}
                            id={id}
                            {...node}
                            animated={true}
                            selected={flow.selectedNodeIds.has(id)}
                            onMouseDown={onNodeMouseDown}
                            onClick={onNodeClick}
                            onHandleMouseDown={onNodeHandleMouseDown}
                        />
                    )), [newlyVisibleNodes, flow.selectedNodeIds, onNodeMouseDown, onNodeClick, onNodeHandleMouseDown])}

                    {useMemo(() => visibleNodes.map(([id, node]) => (
                        <Node
                            key={id}
                            id={id}
                            {...node}
                            selected={flow.selectedNodeIds.has(id)}
                            onMouseDown={onNodeMouseDown}
                            onClick={onNodeClick}
                            onHandleMouseDown={onNodeHandleMouseDown}
                        />
                    )), [visibleNodes, flow.selectedNodeIds, onNodeMouseDown, onNodeClick, onNodeHandleMouseDown])}

                    {useMemo(() => Array.from(flow.visibleEdgeIds.keys())
                        .filter(edgeId => !flow.selectedEdgeIds.has(edgeId))
                        .map(edgeId => [edgeId, flow.edgeStateMap.get(edgeId)!] as [string, EdgeState])
                        .map(([id, edge]) => (
                            <Edge
                                key={id}
                                {...edge}
                            />)
                        ), [flow.visibleEdgeIds, flow.selectedEdgeIds, flow.edgeStateMap])}

                    {useMemo(() => Array.from(flow.newlyVisibleEdgeIds.keys())
                        .filter(edgeId => !flow.selectedEdgeIds.has(edgeId))
                        .map(edgeId => [edgeId, flow.edgeStateMap.get(edgeId)!] as [string, EdgeState])
                        .map(([id, edge]) => (
                            <Edge
                                key={id}
                                {...edge}
                            />)
                        ), [flow.newlyVisibleEdgeIds, flow.selectedEdgeIds, flow.edgeStateMap])}
                </g>

                {useMemo(() => selectedNodes.map(([id, node]) => (
                    <Node
                        key={id}
                        id={id}
                        {...node}
                        draftLayout={flow.draftNodeLayout.get(id)}
                        selected={true}
                        onMouseDown={onNodeMouseDown}
                        onClick={onNodeClick}
                        onHandleMouseDown={onNodeHandleMouseDown}
                    />
                )), [selectedNodes, flow.draftNodeLayout, onNodeMouseDown, onNodeClick, onNodeHandleMouseDown])}

                {useMemo(() => Array.from(flow.selectedEdgeIds.keys())
                    .map(edgeId => [edgeId, flow.edgeStateMap.get(edgeId)!] as [string, EdgeState])
                    .map(([id, edge]) => (
                        <Edge
                            key={id}
                            selected={true}
                            {...edge}
                        />)
                    ), [flow.selectedEdgeIds, flow.edgeStateMap])}
            </g>
        </svg>
    );
}