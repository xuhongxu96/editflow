import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { Node } from './Node';
import { useClientSize } from 'hooks/useClientSize';
import { useFlowDispatchContext, useFlowContext } from 'contexts/FlowContext';
import { Edge } from './Edge';
import * as FlowHooks from 'hooks/flow';

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

    const { newlyVisibleNodes, visibleNodes, selectedNodes } = FlowHooks.useNodes();
    const { newlyVisibleEdges, visibleEdges, selectedEdges } = FlowHooks.useEdges();

    const { onNodeClick, onNodeMouseDown: onNodeMouseDownForSelectableNode } = FlowHooks.useSelectableNode();
    const { onCanvasMouseMove: onCanvasMouseMoveForMovableNode, onNodeMouseDown: onNodeMouseDownForMovableNode } = FlowHooks.useMovableNode();
    const { onCanvasMouseMove: onCanvasMouseMoveForResizableNode, onNodeHandleMouseDown } = FlowHooks.useResizableNode();

    FlowHooks.useSelectableEdge();

    const onCanvasMouseMove = useCallback((e: React.MouseEvent) => {
        onCanvasMouseMoveForMovableNode(e);
        onCanvasMouseMoveForResizableNode(e);
    }, [onCanvasMouseMoveForMovableNode, onCanvasMouseMoveForResizableNode]);

    const onNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
        onNodeMouseDownForSelectableNode(e, nodeId);
        onNodeMouseDownForMovableNode(e, nodeId);
    }, [onNodeMouseDownForSelectableNode, onNodeMouseDownForMovableNode]);

    const updateViewOffsetByDelta = FlowHooks.useUpdateViewOffsetByDelta();

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

                    {useMemo(() => visibleEdges.map(([id, edge]) => (<Edge key={id} {...edge} />)), [visibleEdges])}
                    {useMemo(() => newlyVisibleEdges.map(([id, edge]) => (<Edge key={id} {...edge} />)), [newlyVisibleEdges])}
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

                {useMemo(() => selectedEdges.map(([id, edge]) => (<Edge key={id} selected={true} {...edge} />)), [selectedEdges])}
            </g>
        </svg>
    );
}