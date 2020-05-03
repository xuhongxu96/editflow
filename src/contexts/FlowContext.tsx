import React, { useContext, useEffect, useCallback } from "react";
import { EmptyFlowState, FlowState } from "states/FlowState";
import { FlowDispatch } from "reducers/FlowReducer";
import { useImmerReducer } from 'use-immer';
import { makeFlowReducer } from 'reducers/FlowReducer';
import { useMoving, useEventListener } from "hooks";
import { Offset } from "models/BasicTypes";
import { CanvasStyleContext } from "./CanvasStyleContext";

const FlowContext = React.createContext<FlowState>(EmptyFlowState);
const FlowDispatchContext = React.createContext<FlowDispatch>(() => { })

export const FlowProvider: React.FC<React.PropsWithChildren<{ initialState: FlowState }>> = (props) => {
    const canvasStyle = useContext(CanvasStyleContext);
    const [flow, dispatch] = useImmerReducer(makeFlowReducer(canvasStyle), props.initialState);

    return (
        <FlowDispatchContext.Provider value={dispatch}>
            <FlowContext.Provider value={flow} >
                {props.children}
            </FlowContext.Provider>
        </FlowDispatchContext.Provider>
    );
}

export const useFlow = () => { return useContext(FlowContext); }
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

    // Correct the offset by current scale factor
    const [startResizingNode, stopResizingNode, onResizingNode] = useMoving(useCallback((offset: Offset) => {
        dispatch({ type: 'resizeSelectedNodes', offset: { x: offset.x / scale, y: offset.y / scale } });
    }, [dispatch, scale]));

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

    return { startResizingNode, stopResizingNode, onResizingNode }
}

export const useUpdateVisibleNodes = () => {
    const { viewBound } = useFlow();
    const dispatch = useFlowDispatch();

    useEffect(() => dispatch({ type: 'updateNewlyVisibleNodes' }), [viewBound, dispatch]);

    // After 500ms, newly visible nodes will be added as visible nodes, which will disable the entering animation.
    useEffect(() => {
        const timer = setTimeout(() => dispatch({ type: 'updateVisibleNodes', cacheExpandSize: 500 }), 500);
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
