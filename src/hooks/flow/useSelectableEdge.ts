import { useFlowDispatchContext, useFlowContext } from 'contexts/FlowContext';
import { useCallback, useEffect } from 'react';

export const useSelectableEdge = () => {
  const { selectedEdgeIds, selectedNodeIds, raw } = useFlowContext();
  const dispatch = useFlowDispatchContext();

  const onCanvasMouseDown = useCallback(
    e => {
      dispatch({ type: 'unselectAllEdges' });
    },
    [dispatch]
  );

  useEffect(() => {
    if (selectedEdgeIds.size > 0) {
      dispatch({ type: 'unselectAllNodes' });
    }

    if (selectedNodeIds.isEmpty()) {
      dispatch({
        type: 'setHighlightedNodes',
        ids: Array.from(
          Array.from(selectedEdgeIds.keys())
            .reduce((p, id) => {
              p.add(raw.edges[id].start.nodeId);
              p.add(raw.edges[id].end.nodeId);
              return p;
            }, new Set<string>())
            .keys()
        ),
      });
    }
  }, [raw.edges, selectedNodeIds, selectedEdgeIds, dispatch]);

  const onEdgeMouseDown = useCallback(
    (e, edgeId) => {
      dispatch({ type: 'setSelectEdges', ids: [edgeId] });
      e.stopPropagation();
    },
    [dispatch]
  );

  return { onEdgeMouseDown, onCanvasMouseDown };
};
