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
const FlowDispatchContext = React.createContext<FlowDispatch>(() => { });

export const useFlowState = (flow: Flow): [FlowState, FlowDispatch] => {
    const canvasStyle = useContext(CanvasStyleContext);
    const reducer = useMemo(() => makeFlowReducer(canvasStyle), [canvasStyle]);
    const [flowState, dispatch] = useImmerReducer(reducer, EmptyFlowState);
    useEffect(() => dispatch({ type: 'init', flow: flow }), [flow, dispatch]);
    return [flowState, dispatch];
}

export const FlowProvider: React.FC<React.PropsWithChildren<{ flowState: FlowState, dispatch: FlowDispatch }>> = (props) => {
    const { flowState, dispatch, children } = props;

    return (
        <FlowDispatchContext.Provider value={dispatch}>
            <FlowStateContext.Provider value={flowState} >
                {children}
            </FlowStateContext.Provider>
        </FlowDispatchContext.Provider>
    );
};

export const useFlow = () => { return useContext(FlowStateContext); };
export const useFlowDispatch = () => { return useContext(FlowDispatchContext); };

export const useMovingAndResizingNode = () => {
    const { scale } = useFlow();
    const dispatch = useFlowDispatch();

    // Correct the offset by current scale factor
    const [startMovingNode, stopMovingNode, onMovingNode] = useMoving(useCallback((offset: Offset) => {
        dispatch({ type: 'moveSelectedNodes', offset: { x: offset.x / scale, y: offset.y / scale } });
    }, [dispatch, scale]));

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

    // Mouse up will stop and confirm moving or resizing to update the draft layout to real layout
    useEventListener('mouseup', useCallback(() => {
        stopMovingNode(false);
        stopResizingNode(false);
        dispatch({ type: 'stopMovingNodes', cancel: false });
        dispatch({ type: 'stopResizingNodes', cancel: false });
    }, [stopMovingNode, stopResizingNode, dispatch]));

    useEventListener('keydown', useCallback((e) => {
        // Escape will cancel the current moving or resizing and restore the previous layout
        if (e.key === 'Escape') {
            stopMovingNode(true);
            stopResizingNode(true);
            dispatch({ type: 'stopMovingNodes', cancel: true });
            dispatch({ type: 'stopResizingNodes', cancel: true });
        }
    }, [stopMovingNode, stopResizingNode, dispatch]))

    // Set handle direction to know which direction to resize the node 
    const startResizingNode = useCallback((e: React.MouseEvent, direction: HandleDirection) => {
        setResizeHandleDirection(direction);
        _startResizingNode(e);
    }, [_startResizingNode]);

    return {
        startMovingNode, stopMovingNode, onMovingNode,
        startResizingNode, stopResizingNode, onResizingNode
    };
};

export const useUpdateVisibleNodes = () => {
    const { viewBound } = useFlow();
    const dispatch = useFlowDispatch();

    // Update newly visible nodes once view bound is changed without timeout
    useEffect(() => dispatch({ type: 'updateNewlyVisibleNodes' }), [viewBound, dispatch]);

    // After 500ms without view bound changes, 
    // newly visible nodes will be transformed to confirmed visible nodes,
    // which will disable the entering animation and also has a larger cached view.
    useEffect(() => {
        const timer = setTimeout(() => dispatch({ type: 'updateVisibleNodes', cacheExpandSize: 500 }), 300);
        return () => clearTimeout(timer);
    }, [viewBound, dispatch]);
};

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
};

export const useSelectableNodeAndEdge = () => {
    const { selectedNodeIds, nodeEdgeMap } = useFlow();
    const dispatch = useFlowDispatch();

    useEventListener('mousedown', () => {
        dispatch({ type: 'unselectAllNodes' });
        dispatch({ type: 'unselectAllEdges' });
    });

    useEffect(() => {
        dispatch({
            type: 'setSelectEdges',
            ids: Array.from(Array.from(selectedNodeIds.keys())
                .reduce((p, nodeId) => {
                    nodeEdgeMap.get(nodeId)?.forEach(i => p.add(i));
                    return p;
                }, new Set<string>()).keys())
        });
    }, [nodeEdgeMap, selectedNodeIds, dispatch])
};