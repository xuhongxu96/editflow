import { useFlowDispatchContext } from "contexts/FlowContext";
import { useCallback } from "react";

export const useUpdateViewOffsetByDelta = () => {
    const dispatch = useFlowDispatchContext();

    return useCallback((e: { deltaX: number, deltaY: number }) => {
        const factor = 0.3;
        const delta = { x: factor * e.deltaX, y: factor * e.deltaY };
        dispatch({
            type: 'updateViewOffsetByDelta',
            delta: delta,
        });
    }, [dispatch]);
};