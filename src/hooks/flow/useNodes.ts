import { useFlowContext, useFlowDispatchContext } from 'contexts/FlowContext';
import { useEffect, useMemo } from 'react';
import { Node } from 'models/Flow';

export const useNodes = () => {
  const {
    viewBound,
    newlyVisibleNodeIds,
    visibleNodeIds,
    highlightedNodeIds,
    selectedNodeIds,
    hoveredNodeId,
    raw,
  } = useFlowContext();
  const dispatch = useFlowDispatchContext();

  // Update newly visible nodes once view bound is changed without timeout
  useEffect(() => dispatch({ type: 'updateNewlyVisibleNodes' }), [viewBound, dispatch]);

  // After 500ms without view bound changes,
  // newly visible nodes will be transformed to confirmed visible nodes,
  // which will disable the entering animation and also has a larger cached view.
  useEffect(() => {
    const timer = setTimeout(
      () => dispatch({ type: 'updateVisibleNodes', cacheExpandSize: 500 }),
      300
    );
    return () => clearTimeout(timer);
  }, [viewBound, dispatch]);

  const newlyVisibleNodes = useMemo(
    () =>
      newlyVisibleNodeIds
        .filter(i => !selectedNodeIds.has(i) && !highlightedNodeIds.has(i) && i !== hoveredNodeId)
        .map(i => [i, raw.nodes[i]] as [string, Node]),
    [newlyVisibleNodeIds, highlightedNodeIds, selectedNodeIds, hoveredNodeId, raw.nodes]
  );

  const visibleNodes = useMemo(
    () =>
      Array.from(visibleNodeIds.keys())
        .filter(i => !selectedNodeIds.has(i) && !highlightedNodeIds.has(i) && i !== hoveredNodeId)
        .map(i => [i, raw.nodes[i]] as [string, Node]),
    [visibleNodeIds, highlightedNodeIds, selectedNodeIds, hoveredNodeId, raw.nodes]
  );

  const highlightedNodes = useMemo(
    () =>
      Array.from(highlightedNodeIds.keys())
        .filter(i => i !== hoveredNodeId)
        .map(i => [i, raw.nodes[i]] as [string, Node]),
    [highlightedNodeIds, hoveredNodeId, raw.nodes]
  );

  const selectedNodes = useMemo(
    () =>
      Array.from(selectedNodeIds.keys())
        .filter(i => i !== hoveredNodeId)
        .map(i => [i, raw.nodes[i]] as [string, Node]),
    [selectedNodeIds, hoveredNodeId, raw.nodes]
  );

  return { newlyVisibleNodes, visibleNodes, highlightedNodes, selectedNodes };
};
