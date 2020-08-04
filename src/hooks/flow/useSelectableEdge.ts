import { useFlowDispatchContext, useFlowStackContext } from 'contexts/FlowContext';
import { useEventListener } from 'hooks';
import { useCallback, useEffect } from 'react';
import { OnEdgeMouseEventListener } from 'components/Edge';

export const useSelectableEdge = () => {
  const { present } = useFlowStackContext();
  const { selectedEdgeIds, raw, clientRect, selectedNodeIds } = present;
  const dispatch = useFlowDispatchContext();

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
          dispatch({ type: 'unselectAllEdges' });
        }
      },
      [dispatch, clientRect]
    )
  );

  useEffect(() => {
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
  }, [raw.edges, selectedEdgeIds, dispatch]);

  const onEdgeMouseDown = useCallback<OnEdgeMouseEventListener>(
    (e, edgeId, props) => {
      if (e.ctrlKey) {
        dispatch({ type: 'addSelectEdges', ids: [edgeId] });
      } else if (!props.selected) {
        dispatch({ type: 'setSelectEdges', ids: [edgeId] });
        if (selectedNodeIds.size > 0) dispatch({ type: 'unselectAllNodes' });
      }
      e.stopPropagation();
    },
    [dispatch, selectedNodeIds]
  );

  const onEdgeClick = useCallback<OnEdgeMouseEventListener>(
    (e, id) => {
      if (e.ctrlKey) {
        dispatch({ type: 'unselectEdges', ids: [id] });
      }
    },
    [dispatch]
  );

  return { onEdgeMouseDown, onEdgeClick };
};
