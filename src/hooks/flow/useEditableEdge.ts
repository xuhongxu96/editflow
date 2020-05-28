import { useFlowContext, useFlowDispatchContext } from "contexts/FlowContext";
import { useCallback, useState } from "react";
import { EdgeState } from "models/FlowState";
import { useMoving } from "hooks/useMoving";
import { useEventListener } from "hooks";
import { OnPortMouseEventListener } from "components/Node";
import { getPortPosition } from "utils";

export const useEditableEdge = () => {
    const { raw, selectedPort, targetPort, viewBound, scale } = useFlowContext();
    const dispatch = useFlowDispatchContext();

    const [draftEdge, setDraftEdge] = useState<{ edge: EdgeState, connected: boolean }>();

    const [startMoving, stopMoving, onCanvasMouseMove] = useMoving(useCallback((offset, e) => {
        if (selectedPort && e) {
            setDraftEdge({
                edge: {
                    start: getPortPosition(raw.nodes[selectedPort.nodeId], selectedPort.io, selectedPort.index),
                    end: targetPort ? getPortPosition(raw.nodes[targetPort.nodeId], targetPort.io, targetPort.index) : {
                        x: e.pageX / scale + viewBound.x,
                        y: e.pageY / scale + viewBound.y,
                    },
                },
                connected: targetPort !== undefined,
            });
        }
    }, [raw.nodes, selectedPort, targetPort, viewBound, scale]));

    useEventListener('mouseup', useCallback(() => {
        stopMoving(false);
        setDraftEdge(undefined);
        dispatch({ type: 'unselectPort' });
    }, [stopMoving, dispatch]));

    const onPortMouseDown = useCallback<OnPortMouseEventListener>((e, nodeId, _, io, index) => {
        if (io === 'output') {
            dispatch({ type: 'setSelectPort', nodeId, io, index });
            startMoving(e);
        }
    }, [startMoving, dispatch]);

    const onPortMouseEnter = useCallback<OnPortMouseEventListener>((e, nodeId, _, io, index) => {
        if (io === 'input') {
            dispatch({ type: 'setTargetPort', nodeId, io, index });
        }
    }, [dispatch]);

    const onPortMouseLeave = useCallback<OnPortMouseEventListener>((e, nodeId, _, io, index) => {
        dispatch({ type: 'unsetTargetPort' });
    }, [dispatch]);

    return { onCanvasMouseMove, onPortMouseDown, onPortMouseEnter, onPortMouseLeave, draftEdge };
};