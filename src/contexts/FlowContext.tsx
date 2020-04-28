import React, { useContext, useEffect, useCallback } from "react";
import { EmptyFlowState, FlowState } from "states/FlowState";
import { FlowDispatch } from "reducers/FlowReducer";
import { useImmerReducer } from 'use-immer';
import { FlowReducer } from 'reducers/FlowReducer';
import { useMoving, useEventListener } from "hooks";
import { Offset, Rect } from "models/BasicTypes";

const FlowContext = React.createContext<FlowState>(EmptyFlowState);
const FlowDispatchContext = React.createContext<FlowDispatch>(() => { })

export const FlowProvider: React.FC<React.PropsWithChildren<{ initialState: FlowState }>> = (props) => {
    const [flow, dispatch] = useImmerReducer(FlowReducer, props.initialState);
    useEffect(() => dispatch({ type: 'init' }), [dispatch]);

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

export const useMovingNode = (scale: number) => {
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

export const useUpdatingVisibleNodes = (viewBound: Rect) => {
    const dispatch = useFlowDispatch();

    useEffect(() => dispatch({ type: 'updateNewlyVisibleNodes' }), [viewBound, dispatch]);
    useEffect(() => {
        const timer = setTimeout(() => dispatch({ type: 'updateVisibleNodes', cacheExpandSize: 500 }), 500);
        return () => clearTimeout(timer);
    }, [viewBound, dispatch]);
}

export const useUpdatingViewOffsetByWheel = () => {
    const dispatch = useFlowDispatch();

    const onWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
        const factor = 0.3;
        const delta = { x: factor * e.deltaX, y: factor * e.deltaY };
        dispatch({
            type: 'updateViewOffsetByDelta',
            delta: delta,
        });
        e.stopPropagation();
    }, [dispatch]);
    return onWheel;
}
