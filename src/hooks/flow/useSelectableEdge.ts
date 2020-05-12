import { useFlowDispatchContext } from "contexts/FlowContext";
import { useEventListener } from "hooks";
import { useCallback } from "react";

export const useSelectableEdge = () => {
    const dispatch = useFlowDispatchContext();

    useEventListener('mousedown', () => {
        dispatch({ type: 'unselectAllEdges' });
    });

    const onEdgeMouseDown = useCallback((e, edgeId) => {
        dispatch({ type: 'unselectAllNodes' });
        dispatch({ type: 'setSelectEdges', ids: [edgeId] });
        e.stopPropagation();
    }, [dispatch]);

    return { onEdgeMouseDown };
};