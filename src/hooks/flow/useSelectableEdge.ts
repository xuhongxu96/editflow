import { useFlowDispatchContext, useFlowContext } from "contexts/FlowContext";
import { useEventListener } from "hooks";
import { useCallback, useEffect } from "react";

export const useSelectableEdge = () => {
    const { selectedEdgeIds, raw } = useFlowContext();
    const dispatch = useFlowDispatchContext();

    useEventListener('mousedown', () => {
        dispatch({ type: 'unselectAllEdges' });
    });

    useEffect(() => {
        if (selectedEdgeIds.size > 0) dispatch({ type: 'unselectAllNodes' });

        dispatch({
            type: 'setHighlightedNodes',
            ids: Array.from(Array.from(selectedEdgeIds.keys())
                .reduce((p, id) => {
                    p.add(raw.edges[id].start.nodeId);
                    p.add(raw.edges[id].end.nodeId);
                    return p;
                }, new Set<string>()).keys())
        });
    }, [raw.edges, selectedEdgeIds, dispatch]);

    const onEdgeMouseDown = useCallback((e, edgeId) => {
        dispatch({ type: 'setSelectEdges', ids: [edgeId] });
        e.stopPropagation();
    }, [dispatch]);

    return { onEdgeMouseDown };
};