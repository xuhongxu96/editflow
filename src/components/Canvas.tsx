import React, { useEffect, useMemo, useRef, useCallback, useContext } from 'react';
import { Node, NodeProps, OnNodeMouseEventListener, NodePortEnableCallback } from './Node';
import { useClientRect } from 'hooks/useClientRect';
import { useFlowDispatchContext, useFlowContext } from 'contexts/FlowContext';
import { Edge, EdgeProps, DraftEdge } from './Edge';
import * as FlowHooks from 'hooks/flow';
import { CanvasStyleContext } from 'contexts/CanvasStyleContext';

export interface CanvasProps {
  width: string | number;
  height: string | number;
  readonly?: boolean;
}

export const Canvas: React.FC<CanvasProps> = props => {
  const flow = useFlowContext();
  const dispatch = useFlowDispatchContext();
  const { onEdgeAdded } = useContext(CanvasStyleContext);

  const rootRef = useRef<SVGSVGElement>(null);
  const rootClientRect = useClientRect(rootRef, [props.width, props.height]);
  useEffect(() => dispatch({ type: 'updateClientSize', clientRect: rootClientRect }), [
    rootClientRect,
    dispatch,
  ]);

  const updateViewOffsetByDelta = FlowHooks.useUpdateViewOffsetByDelta();

  const { newlyVisibleNodes, visibleNodes, highlightedNodes, selectedNodes } = FlowHooks.useNodes();
  const { newlyVisibleEdges, visibleEdges, highlightedEdges, selectedEdges } = FlowHooks.useEdges();

  const {
    onNodeClick,
    onNodeMouseDown: onNodeMouseDownForSelectableNode,
  } = FlowHooks.useSelectableNode();
  const {
    onCanvasMouseMove: onCanvasMouseMoveForMovableNode,
    onNodeMouseDown: onNodeMouseDownForMovableNode,
  } = FlowHooks.useMovableNode();
  const {
    onCanvasMouseMove: onCanvasMouseMoveForResizableNode,
    onNodeHandleMouseDown,
  } = FlowHooks.useResizableNode();
  const { onNodeMouseEnter, onNodeMouseLeave } = FlowHooks.useHoverableNode();
  const {
    onCanvasMouseMove: onCanvasMouseMoveForEditableEdge,
    onPortMouseDown,
    onPortMouseUp,
    onPortMouseEnter,
    onPortMouseLeave,
    draftEdge,
  } = FlowHooks.useEditableEdge(rootClientRect);

  const { onEdgeMouseDown } = FlowHooks.useSelectableEdge();

  const onNodeMouseDown = useCallback<OnNodeMouseEventListener>(
    (e, nodeId, props) => {
      onNodeMouseDownForSelectableNode(e, nodeId, props);
      onNodeMouseDownForMovableNode(e, nodeId, props);
    },
    [onNodeMouseDownForSelectableNode, onNodeMouseDownForMovableNode]
  );

  const portEnableCallback = useCallback<NodePortEnableCallback>(
    (id, port, io, index) => {
      if (flow.selectedPort) {
        return onEdgeAdded
          ? onEdgeAdded(
              flow.selectedPort,
              {
                nodeId: id,
                io,
                index,
                raw: port,
              },
              flow.inputPortEdgeMap,
              flow.outputPortEdgeMap
            )
          : true;
      }
      return true;
    },
    [flow.selectedPort, flow.inputPortEdgeMap, flow.outputPortEdgeMap, onEdgeAdded]
  );

  const nodeHandlers = useMemo<Partial<NodeProps>>(
    () => ({
      onMouseDown: onNodeMouseDown,
      onClick: onNodeClick,
      onMouseEnter: onNodeMouseEnter,
      onPortMouseEnter,
      portEnableCallback: visibleNodes.length > 50 ? undefined : portEnableCallback,
    }),
    [
      onNodeMouseDown,
      onNodeClick,
      onNodeMouseEnter,
      onPortMouseEnter,
      portEnableCallback,
      visibleNodes,
    ]
  );

  const hoveredNodeHandlers = useMemo<Partial<NodeProps>>(
    () => ({
      onMouseLeave: onNodeMouseLeave,
      onHandleMouseDown: onNodeHandleMouseDown,
      onPortMouseDown,
      onPortMouseUp,
      onPortMouseLeave,
      portEnableCallback: portEnableCallback,
    }),
    [
      onNodeMouseLeave,
      onNodeHandleMouseDown,
      onPortMouseDown,
      onPortMouseUp,
      onPortMouseLeave,
      portEnableCallback,
    ]
  );

  const edgeHandlers: Partial<EdgeProps> = useMemo(
    () => ({
      onMouseDown: onEdgeMouseDown,
    }),
    [onEdgeMouseDown]
  );

  const { startTranslate, onTranslate } = FlowHooks.useTranslatableCanvas();

  const onCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      onCanvasMouseMoveForResizableNode(e);
      onCanvasMouseMoveForMovableNode(e);
      onCanvasMouseMoveForEditableEdge(e);
      onTranslate(e);
    },
    [
      onCanvasMouseMoveForMovableNode,
      onCanvasMouseMoveForResizableNode,
      onCanvasMouseMoveForEditableEdge,
      onTranslate,
    ]
  );

  FlowHooks.useDeletableNode();
  FlowHooks.useDeletableEdge();

  const blurCanvas =
    (flow.selectedNodeIds.size > 0 || flow.selectedEdgeIds.size > 0) && draftEdge === undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      ref={rootRef}
      width={props.width}
      height={props.height}
      onWheel={e => updateViewOffsetByDelta(e)}
      onMouseMove={onCanvasMouseMove}
      onMouseDown={startTranslate}
    >
      <defs>
        <filter id="blur0" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
        </filter>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow in="SourceGraphic" dx="0" dy="0" stdDeviation="3" />
        </filter>
        <filter
          id="shadow-for-line"
          x={flow.viewBound.x}
          y={flow.viewBound.y}
          width={flow.viewBound.w}
          height={flow.viewBound.h}
          filterUnits="userSpaceOnUse"
        >
          <feDropShadow in="SourceGraphic" dx="0" dy="0" stdDeviation="3" />
        </filter>
      </defs>

      <g transform={`scale(${flow.scale}) translate(${-flow.viewBound.x},${-flow.viewBound.y})`}>
        <g filter={blurCanvas ? 'url(#blur0)' : ''}>
          {useMemo(
            () =>
              newlyVisibleNodes.map(([id, node]) => (
                <Node
                  key={id}
                  id={id}
                  animated={true}
                  selected={flow.selectedNodeIds.has(id)}
                  {...node}
                  {...nodeHandlers}
                  {...(flow.hoveredNodeId === id ? hoveredNodeHandlers : {})}
                />
              )),
            [
              newlyVisibleNodes,
              flow.hoveredNodeId,
              flow.selectedNodeIds,
              nodeHandlers,
              hoveredNodeHandlers,
            ]
          )}

          {useMemo(
            () =>
              visibleNodes.map(([id, node]) => (
                <Node
                  key={id}
                  id={id}
                  selected={flow.selectedNodeIds.has(id)}
                  {...node}
                  {...nodeHandlers}
                  {...(flow.hoveredNodeId === id ? hoveredNodeHandlers : {})}
                />
              )),
            [
              visibleNodes,
              flow.hoveredNodeId,
              flow.selectedNodeIds,
              nodeHandlers,
              hoveredNodeHandlers,
            ]
          )}
        </g>

        {useMemo(
          () =>
            highlightedNodes.map(([id, node]) => (
              <Node
                key={id}
                id={id}
                draftLayout={flow.draftNodeLayout.get(id)}
                highlighted={true}
                {...node}
                {...nodeHandlers}
                {...(flow.hoveredNodeId === id ? hoveredNodeHandlers : {})}
              />
            )),
          [
            highlightedNodes,
            flow.hoveredNodeId,
            flow.draftNodeLayout,
            nodeHandlers,
            hoveredNodeHandlers,
          ]
        )}

        {useMemo(
          () =>
            visibleEdges.map(([id, edge]) => <Edge key={id} id={id} {...edge} {...edgeHandlers} />),
          [visibleEdges, edgeHandlers]
        )}

        {useMemo(
          () =>
            newlyVisibleEdges.map(([id, edge]) => (
              <Edge key={id} id={id} {...edge} {...edgeHandlers} />
            )),
          [newlyVisibleEdges, edgeHandlers]
        )}

        {useMemo(
          () =>
            selectedNodes.map(([id, node]) => (
              <Node
                key={id}
                id={id}
                draftLayout={flow.draftNodeLayout.get(id)}
                selected={true}
                {...node}
                {...nodeHandlers}
                {...(flow.hoveredNodeId === id ? hoveredNodeHandlers : {})}
              />
            )),
          [
            selectedNodes,
            flow.hoveredNodeId,
            flow.draftNodeLayout,
            nodeHandlers,
            hoveredNodeHandlers,
          ]
        )}

        {useMemo(
          () =>
            highlightedEdges.map(([id, edge]) => (
              <Edge key={id} id={id} highlighted={true} {...edge} {...edgeHandlers} />
            )),
          [highlightedEdges, edgeHandlers]
        )}

        {useMemo(
          () =>
            selectedEdges.map(([id, edge]) => (
              <Edge key={id} id={id} selected={true} {...edge} {...edgeHandlers} />
            )),
          [selectedEdges, edgeHandlers]
        )}

        <DraftEdge edge={draftEdge?.edge} connected={draftEdge?.connected} />
      </g>
    </svg>
  );
};
