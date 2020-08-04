import {
  useFlowStackContext,
  useFlowDispatchContext,
  useFlowStackDispatchContext,
} from 'contexts/FlowContext';
import { HandleDirection } from 'components/HandleBox';
import { useState, useCallback } from 'react';
import { Offset } from 'models/BasicTypes';
import { useMoving, useEventListener } from 'hooks';
import { OnNodeHandleMouseDownEventListener } from 'components/Node';
import _ from 'lodash';

export const useResizableNode = () => {
  const { present } = useFlowStackContext();
  const { scale, clientRect } = present;
  const dispatch = useFlowDispatchContext();
  const flowStackDispatch = useFlowStackDispatchContext();

  const [resizeHandleDirection, setResizeHandleDirection] = useState<HandleDirection>();

  // Correct the offset by current scale factor
  const [_startResizingNode, stopResizingNode, onCanvasMouseMove] = useMoving(
    useCallback(
      (offset: Offset) => {
        if (resizeHandleDirection) {
          dispatch({
            type: 'resizeSelectedNodes',
            direction: resizeHandleDirection,
            offset: { x: offset.x / scale, y: offset.y / scale },
          });
        }
      },
      [dispatch, resizeHandleDirection, scale]
    )
  );

  // Mouse up will stop and confirm moving or resizing to update the draft layout to real layout
  useEventListener(
    'mouseup',
    useCallback(
      e => {
        if (
          e.pageX >= clientRect.x &&
          e.pageX <= clientRect.x + clientRect.w &&
          e.pageY >= clientRect.y &&
          e.pageY <= clientRect.h - clientRect.y
        ) {
          stopResizingNode(false);
          dispatch({ type: 'stopResizingNodes', cancel: false });
        }
      },
      [stopResizingNode, dispatch, clientRect]
    )
  );

  useEventListener(
    'keydown',
    useCallback(
      e => {
        // Escape will cancel the current moving or resizing and restore the previous layout
        if (e.key === 'Escape') {
          stopResizingNode(true);
          dispatch({ type: 'stopResizingNodes', cancel: true });
        }
      },
      [stopResizingNode, dispatch]
    )
  );

  const onNodeHandleMouseDown = useCallback<OnNodeHandleMouseDownEventListener>(
    (e, port, direction) => {
      // Set handle direction to know which direction to resize the node
      setResizeHandleDirection(direction);
      _startResizingNode(e);
      e.stopPropagation();
      flowStackDispatch({
        type: 'set',
        newflowState: present,
        quadTree: _.cloneDeep(present.nodeIdQuadTree),
      });
    },
    [_startResizingNode, flowStackDispatch, present]
  );

  return { onNodeHandleMouseDown, onCanvasMouseMove };
};
