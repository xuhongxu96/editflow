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
      <button onClick={() => dispatch({ type: 'undo' })}>Undo</button>
      <button onClick={() => dispatch({ type: 'redo' })}>Redo</button>
      <button
        onClick={() =>
          dispatch({
            type: 'copyNodes',
            onCopy: info => {
              navigator.clipboard.writeText(JSON.stringify(info));
            },
            ids: Array.from(flowState.selectedNodeIds),
          })
        }
      >
        Copy
      </button>
      <button
        onClick={() => {
          navigator.clipboard.readText().then(clipText => {
            dispatch({ type: 'pasteNodes', info: JSON.parse(clipText) });
          });
        }}
      >
        Paste
      </button>
      <button
        onClick={() => {
          dispatch({ type: 'deleteEdges', ids: Array.from(flowState.selectedEdgeIds) });
          dispatch({ type: 'deleteNodes', ids: Array.from(flowState.selectedNodeIds) });
        }}
      >
        Delete
      </button>
      {props.children}
    </div>
  );
};
