import React from 'react';
import {
  useFlowDispatchContext,
  useFlowStackContext,
  useFlowStackDispatchContext,
} from 'contexts/FlowContext';
import Style from './Toolbar.module.css';
import _ from 'lodash';

export const Toolbar: React.FC<React.PropsWithChildren<{}>> = props => {
  const dispatch = useFlowDispatchContext();
  const { present } = useFlowStackContext();
  const flowStackDispatch = useFlowStackDispatchContext();

  return (
    <div className={Style.toolbar} id="toolbar">
      <button onClick={() => dispatch({ type: 'setViewOffset', offset: { x: 0, y: 0 } })}>
        Back to origin
      </button>
      <button onClick={() => dispatch({ type: 'setScale', scale: 1 })}>x1</button>
      <button onClick={() => dispatch({ type: 'setScale', scale: 2 })}>x2</button>
      <button
        onClick={() => {
          present.selectedEdgeIds.forEach(edgeId => dispatch({ type: 'deleteEdge', id: edgeId }));
          present.selectedNodeIds.forEach(nodeId => dispatch({ type: 'deleteNode', id: nodeId }));
          flowStackDispatch({
            type: 'set',
            newflowState: present,
            quadTree: _.cloneDeep(present.nodeIdQuadTree),
          });
        }}
      >
        Delete
      </button>
      <button onClick={() => flowStackDispatch({ type: 'undo' })}>undo</button>
      <button onClick={() => flowStackDispatch({ type: 'redo' })}>redo</button>
      {props.children}
    </div>
  );
};
