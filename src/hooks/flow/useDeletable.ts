import { useEventListener } from 'hooks';
import { useCallback } from 'react';
import { useFlowContext, useFlowDispatchContext } from 'contexts/FlowContext';

export const useDeletableNode = () => {
  const { selectedNodeIds } = useFlowContext();
  const dispatch = useFlowDispatchContext();

  useEventListener(
    'keydown',
    useCallback(
      e => {
        const key = e.key;
        if (key === 'Backspace' || key === 'Delete') {
          selectedNodeIds.forEach(nodeId => dispatch({ type: 'deleteNode', id: nodeId }));
        }
      },
      [dispatch, selectedNodeIds]
    )
  );
};

export const useDeletableEdge = () => {
  const { selectedEdgeIds } = useFlowContext();
  const dispatch = useFlowDispatchContext();

  useEventListener(
    'keydown',
    useCallback(
      e => {
        const key = e.key;
        if (key === 'Backspace' || key === 'Delete') {
          selectedEdgeIds.forEach(edgeId => dispatch({ type: 'deleteEdge', id: edgeId }));
        }
      },
      [dispatch, selectedEdgeIds]
    )
  );
};
