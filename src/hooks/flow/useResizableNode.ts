import { useFlowContext, useFlowDispatchContext } from 'contexts/FlowContext';
import { HandleDirection } from 'components/HandleBox';
import { useState, useCallback } from 'react';
import { IOffset } from 'models/BasicTypes';
import { useMoving, useEventListener } from 'hooks';
import { OnNodeHandleMouseDownEventListener } from 'components/Node';

export const useResizableNode = () => {
  const { scale } = useFlowContext();
  const dispatch = useFlowDispatchContext();

  const [resizeHandleDirection, setResizeHandleDirection] = useState<HandleDirection>();

  // Correct the offset by current scale factor
  const [_startResizingNode, stopResizingNode, onCanvasMouseMove] = useMoving(
    useCallback(
      (offset: IOffset) => {
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
    useCallback(() => {
      if (stopResizingNode(false)) dispatch({ type: 'stopResizingNodes', cancel: false });
    }, [stopResizingNode, dispatch])
  );

  useEventListener(
    'keydown',
    useCallback(
      e => {
        // Escape will cancel the current moving or resizing and restore the previous layout
        if (e.key === 'Escape') {
          if (stopResizingNode(true)) dispatch({ type: 'stopResizingNodes', cancel: true });
        }
      },
      [stopResizingNode, dispatch]
    )
  );

  const onNodeHandleMouseDown = useCallback<OnNodeHandleMouseDownEventListener>(
    (e, _, direction) => {
      // Set handle direction to know which direction to resize the node
      setResizeHandleDirection(direction);
      _startResizingNode(e);
      e.stopPropagation();
    },
    [_startResizingNode]
  );

  return { onNodeHandleMouseDown, onCanvasMouseMove };
};
