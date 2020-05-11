import { useFlowContext, useFlowDispatchContext } from "contexts/FlowContext";
import { useEffect, useMemo } from "react";
import { EdgeState } from "models/FlowState";

export const useEdges = () => {
    const {
        newlyVisibleNodeIds,
        visibleNodeIds,
        newlyVisibleEdgeIds,
        visibleEdgeIds,
        selectedEdgeIds,
        edgeStateMap
    } = useFlowContext();
    const dispatch = useFlowDispatchContext();

    useEffect(() => dispatch({ type: 'updateNewlyVisibleEdges', nodeIds: newlyVisibleNodeIds }),
        [newlyVisibleNodeIds, dispatch]);

    useEffect(() => dispatch({ type: 'updateVisibleEdges', nodeIds: Array.from(visibleNodeIds.keys()) }),
        [visibleNodeIds, dispatch]);

    const visibleEdges = useMemo(() =>
        Array.from(visibleEdgeIds.keys())
            .filter(edgeId => !selectedEdgeIds.has(edgeId))
            .map(edgeId => [edgeId, edgeStateMap.get(edgeId)!] as [string, EdgeState]),
        [visibleEdgeIds, selectedEdgeIds, edgeStateMap]);

    const newlyVisibleEdges = useMemo(() => Array.from(newlyVisibleEdgeIds.keys())
        .filter(edgeId => !selectedEdgeIds.has(edgeId))
        .map(edgeId => [edgeId, edgeStateMap.get(edgeId)!] as [string, EdgeState]),
        [newlyVisibleEdgeIds, selectedEdgeIds, edgeStateMap]);

    const selectedEdges = useMemo(() => Array.from(selectedEdgeIds.keys())
        .map(edgeId => [edgeId, edgeStateMap.get(edgeId)!] as [string, EdgeState]),
        [selectedEdgeIds, edgeStateMap])

    return { newlyVisibleEdges, visibleEdges, selectedEdges };
};