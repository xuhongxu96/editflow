import React, { useCallback } from 'react';
import { useFlowDispatchContext, useFlowContext } from 'contexts/FlowContext';
import { useEventListener } from "hooks";
import Style from './Toolbar.module.css';



export const Toolbar: React.FC<React.PropsWithChildren<{}>> = (props) => {
    const dispatch = useFlowDispatchContext();
    const flowState = useFlowContext();
    useEventListener("keydown", useCallback(
        (e) => {
            const key = e.key; 
            if (key === "Backspace" || key === "Delete") { 
                flowState.selectedEdgeIds.forEach(edgeId => dispatch({ type: 'deleteEdge', id: edgeId }))
                flowState.selectedNodeIds.forEach(nodeId => dispatch({ type: 'deleteNode', id: nodeId }))
            }
        }, [dispatch, flowState]
    ));
    return (
        <div className={Style.toolbar} id="toolbar">
            <button onClick={() => dispatch({ type: 'setViewOffset', offset: { x: 0, y: 0 } })}>
                Back to origin
            </button>
            <button onClick={() => dispatch({ type: 'setScale', scale: 1 })}>
                x1
            </button>
            <button onClick={() => dispatch({ type: 'setScale', scale: 2 })}>
                x2
            </button>
            <button onClick={() => {
                flowState.selectedEdgeIds.forEach(edgeId => dispatch({ type: 'deleteEdge', id: edgeId }))
                flowState.selectedNodeIds.forEach(nodeId => dispatch({ type: 'deleteNode', id: nodeId }))
                }}>
                Delete
            </button>
            {props.children}
        </div >
    );
}

