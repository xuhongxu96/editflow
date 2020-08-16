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
          dispatch({ type: 'deleteNodes', ids: Array.from(selectedNodeIds) });
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
          dispatch({ type: 'deleteEdges', ids: Array.from(selectedEdgeIds) });
        }
      },
      [dispatch, selectedEdgeIds]
    )
  );
};
