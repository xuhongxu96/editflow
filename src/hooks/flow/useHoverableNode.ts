import { useCallback } from 'react';
import { OnNodeMouseEventListener } from 'components/Node';
import { useFlowDispatchContext, useFlowStackContext } from 'contexts/FlowContext';

export const useHoverableNode = () => {
  const { present } = useFlowStackContext();
  const { hoveredNodeId } = present;
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
