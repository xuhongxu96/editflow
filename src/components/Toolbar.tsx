import React from 'react';
import { useFlowDispatchContext, useFlowContext } from 'contexts/FlowContext';
import Style from './Toolbar.module.css';

export const Toolbar: React.FC<React.PropsWithChildren<{}>> = props => {
  const dispatch = useFlowDispatchContext();
  const flowState = useFlowContext();

  return (
    <div className={Style.toolbar} id="toolbar">
      <button onClick={() => dispatch({ type: 'setViewOffset', offset: { x: 0, y: 0 } })}>
        Back to origin
      </button>
      <button onClick={() => dispatch({ type: 'setScale', scale: 1 })}>x1</button>
      <button onClick={() => dispatch({ type: 'setScale', scale: 2 })}>x2</button>
      <button onClick={() => dispatch({ type: 'undo' })}>undo</button>
      <button onClick={() => dispatch({ type: 'redo' })}>redo</button>
      <button
        onClick={() => {
          flowState.selectedEdgeIds.forEach(edgeId => dispatch({ type: 'deleteEdge', id: edgeId }));
          flowState.selectedNodeIds.forEach(nodeId => dispatch({ type: 'deleteNode', id: nodeId }));
        }}
      >
        Delete
      </button>
      {props.children}
    </div>
  );
};
