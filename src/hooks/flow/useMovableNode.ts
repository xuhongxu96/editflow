import { useFlowContext, useFlowDispatchContext } from "contexts/FlowContext";
import { Offset } from "models/BasicTypes";
import { useCallback } from "react";
import { useMoving, useEventListener } from "hooks";

export const useMovableNode = () => {
    const { scale } = useFlowContext();
    const dispatch = useFlowDispatchContext();

    // Correct the offset by current scale factor
    const [startMovingNode, stopMovingNode, onMovingNode] = useMoving(useCallback((offset: Offset) => {
        dispatch({ type: 'moveSelectedNodes', offset: { x: offset.x / scale, y: offset.y / scale } });
    }, [dispatch, scale]));

    // Mouse up will stop and confirm moving or resizing to update the draft layout to real layout
    useEventListener('mouseup', useCallback(() => {
        stopMovingNode(false);
        dispatch({ type: 'stopMovingNodes', cancel: false });
    }, [stopMovingNode, dispatch]));

    useEventListener('keydown', useCallback((e) => {
        // Escape will cancel the current moving or resizing and restore the previous layout
        if (e.key === 'Escape') {
            stopMovingNode(true);
            dispatch({ type: 'stopMovingNodes', cancel: true });
        }
    }, [stopMovingNode, dispatch]))

    const onNodeMouseDown = useCallback((e: React.MouseEvent, id: string) => {
        startMovingNode(e);
        e.stopPropagation();
    }, [startMovingNode]);

    const onCanvasMouseMove = useCallback((e: React.MouseEvent) => {
        return onMovingNode(e);
    }, [onMovingNode]);

    return { onNodeMouseDown, onCanvasMouseMove };
};