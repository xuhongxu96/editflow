import React, { useEffect, useMemo, useRef, useCallback, useContext } from 'react';
import { Node, NodeProps, OnNodeMouseEventListener, NodePortEnableCallback } from './Node';
import { useClientRect } from 'hooks/useClientRect';
import {
  useFlowDispatchContext,
  useFlowStackContext,
  useFlowStackDispatchContext,
} from 'contexts/FlowContext';
import { EmptyFlowState } from 'models/FlowState';
import { Edge, EdgeProps, DraftEdge } from './Edge';
import * as FlowHooks from 'hooks/flow';
import { useEventListener } from 'hooks';
import { CanvasStyleContext } from 'contexts/CanvasStyleContext';
import _ from 'lodash';

export interface CanvasProps {
  width: string | number;
  height: string | number;
  readonly?: boolean;
}

export const Canvas: React.FC<CanvasProps> = props => {
  const { present, update } = useFlowStackContext();
  const dispatch = useFlowDispatchContext();
  const flowStackDispatch = useFlowStackDispatchContext();
  const { onEdgeAdded } = useContext(CanvasStyleContext);

  useEffect(() => {
    if (!_.isEqual(update, EmptyFlowState)) {
      dispatch({ type: 'setNewFlowState', newflowState: update });
    }
  }, [update, dispatch]);

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

  const { onEdgeMouseDown, onEdgeClick } = FlowHooks.useSelectableEdge();

  const onNodeMouseDown = useCallback<OnNodeMouseEventListener>(
    (e, nodeId, props) => {
      onNodeMouseDownForSelectableNode(e, nodeId, props);
      onNodeMouseDownForMovableNode(e, nodeId, props);
    },
    [onNodeMouseDownForSelectableNode, onNodeMouseDownForMovableNode]
  );

  const portEnableCallback = useCallback<NodePortEnableCallback>(
    (id, port, io, index) => {
      if (present.selectedPort) {
        return onEdgeAdded
          ? onEdgeAdded(
              present.selectedPort,
              {
                nodeId: id,
                io,
                index,
                raw: port,
              },
              present.inputPortEdgeMap,
              present.outputPortEdgeMap
            )
          : true;
      }
      return true;
    },
    [present.selectedPort, present.inputPortEdgeMap, present.outputPortEdgeMap, onEdgeAdded]
  );

  const nodeHandlers = useMemo<Partial<NodeProps>>(
    () => ({
      onMouseDown: onNodeMouseDown,
      onClick: onNodeClick,
      onMouseEnter: onNodeMouseEnter,
      onPortMouseEnter,
      portEnableCallback: visibleNodes.length > 100 ? undefined : portEnableCallback,
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
      onClick: onEdgeClick,
    }),
    [onEdgeMouseDown, onEdgeClick]
  );

  const onCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      onCanvasMouseMoveForResizableNode(e);
      onCanvasMouseMoveForMovableNode(e);
      onCanvasMouseMoveForEditableEdge(e);
    },
    [
      onCanvasMouseMoveForMovableNode,
      onCanvasMouseMoveForResizableNode,
      onCanvasMouseMoveForEditableEdge,
    ]
  );

  useEventListener(
    'keydown',
    useCallback(
      e => {
        const key = e.key;
        if (key === 'Backspace' || key === 'Delete') {
          present.selectedEdgeIds.forEach(edgeId => dispatch({ type: 'deleteEdge', id: edgeId }));
          present.selectedNodeIds.forEach(nodeId => dispatch({ type: 'deleteNode', id: nodeId }));
        } else if (e.which === 90 && e.ctrlKey && e.shiftKey) {
          flowStackDispatch({ type: 'redo' });
        } else if (e.ctrlKey && e.which === 90) {
          flowStackDispatch({ type: 'undo' });
        }
      },
      [dispatch, present, flowStackDispatch]
    )
  );

  const blurCanvas =
    (present.selectedNodeIds.size > 0 || present.selectedEdgeIds.size > 0) &&
    draftEdge === undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
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
          <feDropShadow in="SourceGraphic" dx="0" dy="0" stdDeviation="3" />
        </filter>
        <filter
          id="shadow-for-line"
          x={present.viewBound.x}
          y={present.viewBound.y}
          width={present.viewBound.w}
          height={present.viewBound.h}
          filterUnits="userSpaceOnUse"
        >
          <feDropShadow in="SourceGraphic" dx="0" dy="0" stdDeviation="3" />
        </filter>
      </defs>

      <g
        transform={`scale(${present.scale}) translate(${-present.viewBound.x},${-present.viewBound
          .y})`}
      >
        <g filter={blurCanvas ? 'url(#blur0)' : ''}>
          {useMemo(
            () =>
              newlyVisibleNodes.map(([id, node]) => (
                <Node
                  key={id}
                  id={id}
                  animated={true}
                  selected={present.selectedNodeIds.has(id)}
                  {...node}
                  {...nodeHandlers}
                  {...(present.hoveredNodeId === id ? hoveredNodeHandlers : {})}
                />
              )),
            [
              newlyVisibleNodes,
              present.hoveredNodeId,
              present.selectedNodeIds,
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
                  selected={present.selectedNodeIds.has(id)}
                  {...node}
                  {...nodeHandlers}
                  {...(present.hoveredNodeId === id ? hoveredNodeHandlers : {})}
                />
              )),
            [
              visibleNodes,
              present.hoveredNodeId,
              present.selectedNodeIds,
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
                draftLayout={present.draftNodeLayout.get(id)}
                highlighted={true}
                {...node}
                {...nodeHandlers}
                {...(present.hoveredNodeId === id ? hoveredNodeHandlers : {})}
              />
            )),
          [
            highlightedNodes,
            present.hoveredNodeId,
            present.draftNodeLayout,
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
                draftLayout={present.draftNodeLayout.get(id)}
                selected={true}
                {...node}
                {...nodeHandlers}
                {...(present.hoveredNodeId === id ? hoveredNodeHandlers : {})}
              />
            )),
          [
            selectedNodes,
            present.hoveredNodeId,
            present.draftNodeLayout,
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
