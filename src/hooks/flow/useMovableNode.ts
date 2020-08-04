import {
  useFlowStackContext,
  useFlowDispatchContext,
  useFlowStackDispatchContext,
} from 'contexts/FlowContext';
import { useCallback } from 'react';
import { useMoving, useEventListener } from 'hooks';
import { OnNodeMouseEventListener } from 'components/Node';
import _ from 'lodash';

export const useMovableNode = () => {
  const { present } = useFlowStackContext();
  const { scale, clientRect } = present;
  const dispatch = useFlowDispatchContext();
  const flowStackDispatch = useFlowStackDispatchContext();

  // Correct the offset by current scale factor
  const [startMovingNode, stopMovingNode, onCanvasMouseMove] = useMoving(
    useCallback(
      offset => {
        dispatch({
          type: 'moveSelectedNodes',
          offset: { x: offset.x / scale, y: offset.y / scale },
        });
      },
      [dispatch, scale]
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
          stopMovingNode(false);
          dispatch({ type: 'stopMovingNodes', cancel: false });
        }
      },
      [stopMovingNode, dispatch, clientRect]
    )
  );

  useEventListener(
    'keydown',
    useCallback(
      e => {
        // Escape will cancel the current moving or resizing and restore the previous layout
        if (e.key === 'Escape') {
          stopMovingNode(true);
          dispatch({ type: 'stopMovingNodes', cancel: true });
        }
      },
      [stopMovingNode, dispatch]
    )
  );

  const onNodeMouseDown = useCallback<OnNodeMouseEventListener>(
    (e, id) => {
      startMovingNode(e);
      e.stopPropagation();
      flowStackDispatch({
        type: 'set',
        newflowState: present,
        quadTree: _.cloneDeep(present.nodeIdQuadTree),
      });
    },
    [startMovingNode, flowStackDispatch, present]
  );

  return { onNodeMouseDown, onCanvasMouseMove };
};
