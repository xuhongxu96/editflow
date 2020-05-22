import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { Node, NodeProps } from './Node';
import { useClientSize } from 'hooks/useClientSize';
import { useFlowDispatchContext, useFlowContext } from 'contexts/FlowContext';
import { Edge, EdgeProps, DraftEdge } from './Edge';
import * as FlowHooks from 'hooks/flow';
import { useTraceUpdate } from 'hooks';

export interface CanvasProps {
    width: string | number;
    height: string | number;
    readonly?: boolean;
}

export const Canvas: React.FC<CanvasProps> = (props) => {
    const flow = useFlowContext();
    const dispatch = useFlowDispatchContext();

    const rootRef = useRef<SVGSVGElement>(null);
    const rootClientSize = useClientSize(rootRef, [props.width, props.height]);
    useEffect(() => dispatch({ type: 'updateClientSize', clientSize: rootClientSize }), [rootClientSize, dispatch]);

    const updateViewOffsetByDelta = FlowHooks.useUpdateViewOffsetByDelta();

    const { newlyVisibleNodes, visibleNodes, highlightedNodes, selectedNodes } = FlowHooks.useNodes();
    const { newlyVisibleEdges, visibleEdges, highlightedEdges, selectedEdges } = FlowHooks.useEdges();

    const { onNodeClick, onNodeMouseDown: onNodeMouseDownForSelectableNode } = FlowHooks.useSelectableNode();
    const { onCanvasMouseMove: onCanvasMouseMoveForMovableNode, onNodeMouseDown: onNodeMouseDownForMovableNode } = FlowHooks.useMovableNode();
    const { onCanvasMouseMove: onCanvasMouseMoveForResizableNode, onNodeHandleMouseDown } = FlowHooks.useResizableNode();
    const { onCanvasMouseMove: onCanvasMouseMoveForEditableEdge, onPortMouseDown, draftEdge } = FlowHooks.useEditableEdge();

    const { onEdgeMouseDown } = FlowHooks.useSelectableEdge();

    const onNodeMouseDown = useCallback((e, nodeId) => {
        onNodeMouseDownForSelectableNode(e, nodeId);
        onNodeMouseDownForMovableNode(e, nodeId);
    }, [onNodeMouseDownForSelectableNode, onNodeMouseDownForMovableNode]);

    const nodeHandlers: Partial<NodeProps> = useMemo(() => ({
        onMouseDown: onNodeMouseDown,
        onClick: onNodeClick,
        onHandleMouseDown: onNodeHandleMouseDown,
        onPortMouseDown: onPortMouseDown,
    }), [onNodeMouseDown, onNodeClick, onNodeHandleMouseDown, onPortMouseDown]);

    useTraceUpdate({ onNodeMouseDownForMovableNode, onNodeMouseDownForSelectableNode });

    const edgeHandlers: Partial<EdgeProps> = useMemo(() => ({
        onMouseDown: onEdgeMouseDown,
    }), [onEdgeMouseDown]);

    const onCanvasMouseMove = useCallback((e: React.MouseEvent) => {
        onCanvasMouseMoveForResizableNode(e);
        onCanvasMouseMoveForMovableNode(e);
        onCanvasMouseMoveForEditableEdge(e);
    }, [onCanvasMouseMoveForMovableNode, onCanvasMouseMoveForResizableNode, onCanvasMouseMoveForEditableEdge]);

    const blurCanvas = (flow.selectedNodeIds.size > 0 || flow.selectedEdgeIds.size > 0) &&
        draftEdge === undefined;

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            ref={rootRef}
            width={props.width}
            height={props.height}
            onWheel={e => updateViewOffsetByDelta(e)}
            onMouseMove={onCanvasMouseMove}
        >
            <defs>
                <filter id="blur0" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
                </filter>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                    <feBlend in="SourceGraphic" in2="blur" mode="normal" />
                </filter>
            </defs>

            <g transform={`scale(${flow.scale}) translate(${-flow.viewBound.x},${-flow.viewBound.y})`}>
                <g filter={blurCanvas ? 'url(#blur0)' : ''}>
                    {useMemo(() => newlyVisibleNodes.map(([id, node]) => (
                        <Node key={id} id={id} animated={true} selected={flow.selectedNodeIds.has(id)}
                            {...node} {...nodeHandlers} />
                    )), [newlyVisibleNodes, flow.selectedNodeIds, nodeHandlers])}

                    {useMemo(() => visibleNodes.map(([id, node]) => (
                        <Node key={id} id={id} selected={flow.selectedNodeIds.has(id)}
                            {...node} {...nodeHandlers} />
                    )), [visibleNodes, flow.selectedNodeIds, nodeHandlers])}

                    {useMemo(() => visibleEdges.map(([id, edge]) => (
                        <Edge key={id} id={id} {...edge} {...edgeHandlers} />
                    )), [visibleEdges, edgeHandlers])}

                    {useMemo(() => newlyVisibleEdges.map(([id, edge]) => (
                        <Edge key={id} id={id} {...edge} {...edgeHandlers} />
                    )), [newlyVisibleEdges, edgeHandlers])}
                </g>

                {useMemo(() => highlightedNodes.map(([id, node]) => (
                    <Node key={id} id={id} draftLayout={flow.draftNodeLayout.get(id)} highlighted={true}
                        {...node} {...nodeHandlers} />
                )), [highlightedNodes, flow.draftNodeLayout, nodeHandlers])}

                {useMemo(() => selectedNodes.map(([id, node]) => (
                    <Node key={id} id={id} draftLayout={flow.draftNodeLayout.get(id)} selected={true}
                        {...node} {...nodeHandlers} />
                )), [selectedNodes, flow.draftNodeLayout, nodeHandlers])}

                {useMemo(() => highlightedEdges.map(([id, edge]) => (
                    <Edge key={id} id={id} highlighted={true} {...edge} {...edgeHandlers} />
                )), [highlightedEdges, edgeHandlers])}

                {useMemo(() => selectedEdges.map(([id, edge]) => (
                    <Edge key={id} id={id} selected={true} {...edge} {...edgeHandlers} />
                )), [selectedEdges, edgeHandlers])}

                <DraftEdge edge={draftEdge} />
            </g>
        </svg>
    );
}