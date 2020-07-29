import { useCallback } from 'react';
import { OnNodeMouseEventListener } from 'components/Node';
import { useFlowDispatchContext, useFlowContext } from 'contexts/FlowContext';

export const useHoverableNode = () => {
  const { hoveredNodeId } = useFlowContext();
  const dispatch = useFlowDispatchContext();

  const onNodeMouseEnter = useCallback<OnNodeMouseEventListener>(
    (e, id) => {
      dispatch({ type: 'setHoveredNode', id: id });
    },
    [dispatch]
  );

  const onNodeMouseLeave = useCallback<OnNodeMouseEventListener>(
    (e, id) => {
      if (hoveredNodeId === id) dispatch({ type: 'unsetHoveredNode' });
    },
    [hoveredNodeId, dispatch]
  );

  return { onNodeMouseEnter, onNodeMouseLeave };
};
