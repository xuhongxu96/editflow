import { useFlowContext, useFlowDispatchContext } from "contexts/FlowContext";
import { useEventListener } from "hooks";
import { useEffect } from "react";

export const useSelectableEdge = () => {
    const { selectedNodeIds, nodeEdgeMap } = useFlowContext();
    const dispatch = useFlowDispatchContext();

    useEventListener('mousedown', () => {
        dispatch({ type: 'unselectAllEdges' });
    });

    useEffect(() => {
        dispatch({
            type: 'setSelectEdges',
            ids: Array.from(Array.from(selectedNodeIds.keys())
                .reduce((p, nodeId) => {
                    nodeEdgeMap.get(nodeId)?.forEach(i => p.add(i));
                    return p;
                }, new Set<string>()).keys())
        });
    }, [nodeEdgeMap, selectedNodeIds, dispatch])
};