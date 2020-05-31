import { useFlowContext, useFlowDispatchContext } from "contexts/FlowContext";
import { Offset } from "models/BasicTypes";
import { useCallback } from "react";
import { useMoving, useEventListener } from "hooks";
import { OnNodeMouseEventListener } from "components/Node";

export const useMovableNode = () => {
    const { scale } = useFlowContext();
    const dispatch = useFlowDispatchContext();

    // Correct the offset by current scale factor
    const [startMovingNode, stopMovingNode, onCanvasMouseMove] = useMoving(useCallback((offset: Offset) => {
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

    const onNodeMouseDown = useCallback<OnNodeMouseEventListener>((e, id) => {
        startMovingNode(e);
        e.stopPropagation();
    }, [startMovingNode]);

    return { onNodeMouseDown, onCanvasMouseMove };
};