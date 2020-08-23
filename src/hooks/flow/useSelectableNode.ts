import { useFlowDispatchContext } from 'contexts/FlowContext';
import { useCallback } from 'react';
import { OnNodeMouseEventListener } from 'components/Node';

export function useSelectableNode() {
  const dispatch = useFlowDispatchContext();
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

  const onCanvasMouseDown = useCallback(
    e => {
      dispatch({ type: 'unselectAllNodes' });
    },
    [dispatch]
  );

  return { onNodeMouseDown, onNodeClick, onCanvasMouseDown };
}
