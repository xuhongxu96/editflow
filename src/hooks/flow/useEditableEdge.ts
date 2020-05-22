import { useFlowContext, useFlowDispatchContext } from "contexts/FlowContext";
import { useCallback, useState } from "react";
import { EdgeState } from "models/FlowState";
import { useMoving } from "hooks/useMoving";
import { useEventListener } from "hooks";
import { OnPortMouseDownEventListener } from "components/Node";
import { getPortPosition } from "utils";

export const useEditableEdge = () => {
    const { raw, selectedPort, viewBound } = useFlowContext();
    const dispatch = useFlowDispatchContext();

    const [draftEdge, setDraftEdge] = useState<EdgeState>();

    const [startMoving, stopMoving, onCanvasMouseMove] = useMoving(useCallback((offset, e) => {
        if (selectedPort && e) {
            setDraftEdge({
                start: getPortPosition(raw.nodes[selectedPort.nodeId], selectedPort.type, selectedPort.index),
                end: {
                    x: e.pageX + viewBound.x,
                    y: e.pageY + viewBound.y,
                },
            });
        }
    }, [raw.nodes, selectedPort, viewBound]));

    useEventListener('mouseup', useCallback(() => {
        stopMoving(false);
        setDraftEdge(undefined);
        dispatch({ type: 'unselectPort' });
    }, [stopMoving, dispatch]));

    const onPortMouseDown = useCallback<OnPortMouseDownEventListener>((e, nodeId, port, portType, portIndex) => {
        if (portType === 'output') {
            dispatch({ type: 'setSelectPort', nodeId, portType, portIndex });
            startMoving(e);
        }
    }, [startMoving, dispatch]);

    return { onCanvasMouseMove, onPortMouseDown, draftEdge };
};