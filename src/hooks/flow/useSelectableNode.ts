import { useFlowDispatchContext, useFlowContext } from 'contexts/FlowContext';
import { useCallback } from 'react';
import { useEventListener } from 'hooks';
import { OnNodeMouseEventListener } from 'components/Node';

export const useSelectableNode = () => {
  const dispatch = useFlowDispatchContext();
  const { clientRect } = useFlowContext();
  const onNodeMouseDown = useCallback<OnNodeMouseEventListener>(
    (e, id, props) => {
      if (e.ctrlKey) {
        dispatch({ type: 'addSelectNodes', ids: [id] });
      } else if (!props.selected) {
        dispatch({ type: 'setSelectNodes', ids: [id] });
      }
      e.stopPropagation();
    },
    [dispatch]
  );

  const onNodeClick = useCallback<OnNodeMouseEventListener>(
    (e, id) => {
      // No need to check if it is selected here, because when node is selected,
      // it will be moved from visibleNodes to selectedNodes, and the click event won't be triggered.
      if (e.ctrlKey) {
        dispatch({ type: 'unselectNodes', ids: [id] });
      }
    },
    [dispatch]
  );

  useEventListener(
    'mousedown',
    useCallback(
      e => {
        if (
          e.pageX >= clientRect.x &&
          e.pageX <= clientRect.x + clientRect.w &&
          e.pageY >= clientRect.y &&
          e.pageY <= clientRect.h - clientRect.y
        ) {
          dispatch({ type: 'unselectAllNodes' });
        }
      },
      [dispatch, clientRect]
    )
  );

  return { onNodeMouseDown, onNodeClick };
};
