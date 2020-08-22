import { useFlowContext, useFlowDispatchContext } from 'contexts/FlowContext';
import { useEffect, useMemo } from 'react';
import { IEdgeState } from 'models/FlowState';

export const useEdges = () => {
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
    raw,
  } = useFlowContext();
  const dispatch = useFlowDispatchContext();

  useEffect(
    () => dispatch({ type: 'updateNewlyVisibleEdges', nodeIds: newlyVisibleNodeIds.toJS() }),
    [newlyVisibleNodeIds, dispatch]
  );

  useEffect(
    () => dispatch({ type: 'updateVisibleEdges', nodeIds: Array.from(visibleNodeIds.keys()) }),
    [visibleNodeIds, dispatch]
  );

  useEffect(() => {
    if (selectedNodeIds.size > 0) {
      dispatch({ type: 'unselectAllEdges' });
    }

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

    dispatch({
      type: 'setHighlightedNodes',
      ids: Array.from(
        Array.from(selectedNodeIds.keys())
          .reduce((p, nodeId) => {
            nodeEdgeMap.get(nodeId)?.forEach(i => {
              console.log(raw.edges[i]);
              if (!selectedNodeIds.has(raw.edges[i].start.nodeId)) {
                p.add(raw.edges[i].start.nodeId);
              }
              if (!selectedNodeIds.has(raw.edges[i].end.nodeId)) {
                p.add(raw.edges[i].end.nodeId);
              }
            });
            return p;
          }, new Set<string>())
          .keys()
      ),
    });
  }, [selectedNodeIds, nodeEdgeMap, raw.edges, dispatch]);

  const visibleEdges = useMemo(
    () =>
      Array.from(visibleEdgeIds.keys())
        .filter(edgeId => !selectedEdgeIds.has(edgeId) && !highlightedEdgeIds.has(edgeId))
        .map(edgeId => [edgeId, edgeStateMap.get(edgeId)!.toJS()] as [string, IEdgeState]),
    [visibleEdgeIds, highlightedEdgeIds, selectedEdgeIds, edgeStateMap]
  );

  const newlyVisibleEdges = useMemo(
    () =>
      Array.from(newlyVisibleEdgeIds.keys())
        .filter(edgeId => !selectedEdgeIds.has(edgeId) && !highlightedEdgeIds.has(edgeId))
        .map(edgeId => [edgeId, edgeStateMap.get(edgeId)!.toJS()] as [string, IEdgeState]),
    [newlyVisibleEdgeIds, highlightedEdgeIds, selectedEdgeIds, edgeStateMap]
  );

  const highlightedEdges = useMemo(
    () =>
      Array.from(highlightedEdgeIds.keys())
        .map(edgeId => [edgeId, edgeStateMap.get(edgeId)?.toJS()] as [string, IEdgeState])
        .filter(([_, s]) => s !== undefined),
    [highlightedEdgeIds, edgeStateMap]
  );

  const selectedEdges = useMemo(
    () =>
      Array.from(selectedEdgeIds.keys()).map(
        edgeId => [edgeId, edgeStateMap.get(edgeId)!.toJS()] as [string, IEdgeState]
      ),
    [selectedEdgeIds, edgeStateMap]
  );

  return { newlyVisibleEdges, visibleEdges, highlightedEdges, selectedEdges };
};
