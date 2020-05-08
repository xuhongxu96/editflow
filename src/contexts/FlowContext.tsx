import React, { useContext, useEffect, useCallback, useMemo, useState } from "react";
import { FlowDispatch } from "reducers/FlowReducer";
import { useImmerReducer } from 'use-immer';
import { makeFlowReducer } from 'reducers/FlowReducer';
import { useMoving, useEventListener } from "hooks";
import { Offset } from "models/BasicTypes";
import { CanvasStyleContext } from "./CanvasStyleContext";
import { Flow } from "models/Flow";
import { EmptyFlowState, FlowState } from "models/FlowState";
import { HandleDirection } from "components/HandleBox";

const FlowStateContext = React.createContext<FlowState>(EmptyFlowState);
const FlowDispatchContext = React.createContext<FlowDispatch>(() => { })

export const FlowProvider: React.FC<React.PropsWithChildren<{ flow: Flow, onFlowChanged?: (flow: Flow) => void }>> = (props) => {
    const canvasStyle = useContext(CanvasStyleContext);
    const reducer = useMemo(() => makeFlowReducer(canvasStyle), [canvasStyle]);
    const [flowState, dispatch] = useImmerReducer(reducer, EmptyFlowState);

    const { flow, onFlowChanged, children } = props;

    useEffect(() => dispatch({ type: 'init', flow: flow }), [flow, dispatch]);
    useEffect(() => onFlowChanged && onFlowChanged(flowState.raw), [onFlowChanged, flowState.raw])

    return (
        <FlowDispatchContext.Provider value={dispatch}>
            <FlowStateContext.Provider value={flowState} >
                {children}
            </FlowStateContext.Provider>
        </FlowDispatchContext.Provider>
    );
}

export const useFlow = () => { return useContext(FlowStateContext); }
export const useFlowDispatch = () => { return useContext(FlowDispatchContext); }

export const useMovingNode = () => {
    const { scale } = useFlow();
    const dispatch = useFlowDispatch();

    // Correct the offset by current scale factor
    const [startMovingNode, stopMovingNode, onMovingNode] = useMoving(useCallback((offset: Offset) => {
        dispatch({ type: 'moveSelectedNodes', offset: { x: offset.x / scale, y: offset.y / scale } });
    }, [dispatch, scale]));

    // Mouse up will stop and confirm moving to update the draft position to real position
    useEventListener('mouseup', useCallback(() => {
        stopMovingNode(false);
        dispatch({ type: 'stopMovingNodes', cancel: false });
    }, [stopMovingNode, dispatch]));

    useEventListener('keydown', useCallback((e) => {
        // Escape will cancel the current moving and restore the previous position
        if (e.key === 'Escape') {
            stopMovingNode(true);
            dispatch({ type: 'stopMovingNodes', cancel: true });
        }
    }, [stopMovingNode, dispatch]))

    return { startMovingNode, stopMovingNode, onMovingNode }
}

export const useResizingNode = () => {
    const { scale } = useFlow();
    const dispatch = useFlowDispatch();
    const [resizeHandleDirection, setResizeHandleDirection] = useState<HandleDirection>();

    // Correct the offset by current scale factor
    const [_startResizingNode, stopResizingNode, onResizingNode] = useMoving(useCallback((offset: Offset) => {
        if (resizeHandleDirection) {
            dispatch({
                type: 'resizeSelectedNodes',
                direction: resizeHandleDirection,
                offset: { x: offset.x / scale, y: offset.y / scale }
            });
        }
    }, [dispatch, resizeHandleDirection, scale]));

    // Mouse up will stop and confirm resizing to update the draft layout to real layout
    useEventListener('mouseup', useCallback(() => {
        stopResizingNode(false);
        dispatch({ type: 'stopResizingNodes', cancel: false });
    }, [stopResizingNode, dispatch]));

    useEventListener('keydown', useCallback((e) => {
        // Escape will cancel the current moving and restore the previous position
        if (e.key === 'Escape') {
            stopResizingNode(true);
            dispatch({ type: 'stopResizingNodes', cancel: true });
        }
    }, [stopResizingNode, dispatch]))

    const startResizingNode = useCallback((e: React.MouseEvent, direction: HandleDirection) => {
        setResizeHandleDirection(direction);
        _startResizingNode(e);
    }, [_startResizingNode]);

    return { startResizingNode, stopResizingNode, onResizingNode }
}

export const useUpdateVisibleNodes = () => {
    const { viewBound } = useFlow();
    const dispatch = useFlowDispatch();

    useEffect(() => dispatch({ type: 'updateNewlyVisibleNodes' }), [viewBound, dispatch]);

    // After 500ms, newly visible nodes will be added as visible nodes, which will disable the entering animation.
    useEffect(() => {
        const timer = setTimeout(() => dispatch({ type: 'updateVisibleNodes', cacheExpandSize: 500 }), 300);
        return () => clearTimeout(timer);
    }, [viewBound, dispatch]);
}

export const useUpdateViewOffsetByDelta = () => {
    const dispatch = useFlowDispatch();

    return useCallback((e: { deltaX: number, deltaY: number }) => {
        const factor = 0.3;
        const delta = { x: factor * e.deltaX, y: factor * e.deltaY };
        dispatch({
            type: 'updateViewOffsetByDelta',
            delta: delta,
        });
    }, [dispatch]);
}
