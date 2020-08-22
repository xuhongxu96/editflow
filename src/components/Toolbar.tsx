import React from 'react';
import { useFlowDispatchContext, useFlowContext } from 'contexts/FlowContext';
import Style from './Toolbar.module.css';
import { pasteText, copyText } from 'utils';

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
        onClick={() => {
          dispatch({
            type: 'copyNodes',
            onCopy: info => copyText(JSON.stringify(info)),
            ids: Array.from(flowState.selectedNodeIds),
          });
          dispatch({ type: 'deleteNodes', ids: Array.from(flowState.selectedNodeIds) });
        }}
      >
        {' '}
        Cut{' '}
      </button>
      <button
        onClick={() =>
          dispatch({
            type: 'copyNodes',
            onCopy: info => copyText(JSON.stringify(info)),
            ids: Array.from(flowState.selectedNodeIds),
          })
        }
      >
        Copy
      </button>
      <button
        onClick={() => {
          pasteText().then(clipText => {
            try {
              const info = JSON.parse(clipText);
              dispatch({ type: 'pasteNodes', info: info });
            } catch {
              console.error('Invalid copy info');
            }
          });
        }}
      >
        Paste
      </button>
      <button
        onClick={() => {
          dispatch({ type: 'deleteNodes', ids: Array.from(flowState.selectedNodeIds) });
          dispatch({ type: 'deleteEdges', ids: Array.from(flowState.selectedEdgeIds) });
        }}
      >
        {' '}
        Delete{' '}
      </button>
      {props.children}
    </div>
  );
};
