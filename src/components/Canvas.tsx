import React, { useEffect, useMemo, useRef } from 'react';
import { Node } from './Node';
import { useClientSize } from 'hooks/useClientSize';
import { useFlowDispatch, useFlow, useMovingNode, useUpdateVisibleNodes, useUpdateViewOffsetByDelta } from 'contexts/FlowContext';
import * as Flow from 'models/Flow';
import { useEventListener } from 'hooks';

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
    useEventListener('mousedown', () => { dispatch({ type: 'unselectAllNodes' }) });
    const { startMovingNode, onMovingNode } = useMovingNode();
    const updateViewOffsetByDelta = useUpdateViewOffsetByDelta();

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            ref={rootRef}
            width={props.width}
            height={props.height}
            onWheel={e => updateViewOffsetByDelta(e)}
            onMouseMove={e => { onMovingNode(e); }}
        >
            <g transform={`scale(${flow.scale})`}>
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
            </g>
        </svg>
    );
}