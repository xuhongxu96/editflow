import { useFlowStackContext, useFlowDispatchContext } from 'contexts/FlowContext';
import { useEffect, useMemo } from 'react';
import { EdgeState } from 'models/FlowState';

export const useEdges = () => {
  const { present } = useFlowStackContext();
  const {
    newlyVisibleNodeIds,
    visibleNodeIds,
    selectedNodeIds,
    newlyVisibleEdgeIds,
    visibleEdgeIds,
    highlightedEdgeIds,
    selectedEdgeIds,
    nodeEdgeMap,
    edgeStateMap,
  } = present;
  const dispatch = useFlowDispatchContext();

  useEffect(() => dispatch({ type: 'updateNewlyVisibleEdges', nodeIds: newlyVisibleNodeIds }), [
    newlyVisibleNodeIds,
    dispatch,
  ]);

  useEffect(
    () => dispatch({ type: 'updateVisibleEdges', nodeIds: Array.from(visibleNodeIds.keys()) }),
    [visibleNodeIds, dispatch]
  );

  useEffect(() => {
    dispatch({
      type: 'setHighlightedEdges',
      ids: Array.from(
        Array.from(selectedNodeIds.keys())
          .reduce((p, nodeId) => {
            nodeEdgeMap.get(nodeId)?.forEach(i => p.add(i));
            return p;
          }, new Set<string>())
          .keys()
      ),
    });
  }, [selectedNodeIds, nodeEdgeMap, dispatch]);

  const visibleEdges = useMemo(
    () =>
      Array.from(visibleEdgeIds.keys())
        .filter(edgeId => !selectedEdgeIds.has(edgeId) && !highlightedEdgeIds.has(edgeId))
        .map(edgeId => [edgeId, edgeStateMap.get(edgeId)!] as [string, EdgeState]),
    [visibleEdgeIds, highlightedEdgeIds, selectedEdgeIds, edgeStateMap]
  );

  const newlyVisibleEdges = useMemo(
    () =>
      Array.from(newlyVisibleEdgeIds.keys())
        .filter(edgeId => !selectedEdgeIds.has(edgeId) && !highlightedEdgeIds.has(edgeId))
        .map(edgeId => [edgeId, edgeStateMap.get(edgeId)!] as [string, EdgeState]),
    [newlyVisibleEdgeIds, highlightedEdgeIds, selectedEdgeIds, edgeStateMap]
  );

  const highlightedEdges = useMemo(
    () =>
      Array.from(highlightedEdgeIds.keys()).map(
        edgeId => [edgeId, edgeStateMap.get(edgeId)] as [string, EdgeState]
      ),
    [highlightedEdgeIds, edgeStateMap]
  );

  const selectedEdges = useMemo(
    () =>
      Array.from(selectedEdgeIds.keys()).map(
        edgeId => [edgeId, edgeStateMap.get(edgeId)!] as [string, EdgeState]
      ),
    [selectedEdgeIds, edgeStateMap]
  );

  return { newlyVisibleEdges, visibleEdges, highlightedEdges, selectedEdges };
};
