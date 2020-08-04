import React, { useCallback, useState, useContext } from 'react';
import Style from './NodeToolbox.module.css';
import { NodeTemplate } from 'models/NodeTemplate';
import {
  useFlowDispatchContext,
  useFlowStackContext,
  useFlowStackDispatchContext,
} from 'contexts/FlowContext';
import { useMoving, useEventListener } from 'hooks';
import { CanvasStyleContext } from 'contexts/CanvasStyleContext';
import _ from 'lodash';

export interface NodeToolboxProps {
  nodeTemplates: NodeTemplate[];
}

export const NodeToolbox: React.FC<NodeToolboxProps> = props => {
  const { present } = useFlowStackContext();
  const { clientRect, viewBound, scale } = present;
  const { defaultNodeSize } = useContext(CanvasStyleContext);
  const dispatch = useFlowDispatchContext();
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const flowStackDispatch = useFlowStackDispatchContext();

  const [startMoving, stopMoving, onMoving] = useMoving(
    useCallback(
      offset => {
        if (selectedIndex !== undefined) {
          dispatch({
            type: 'moveDraftNode',
            offset: { x: offset.x / scale, y: offset.y / scale },
          });
        }
      },
      [dispatch, selectedIndex, scale]
    )
  );

  const onMouseDown = useCallback(
    (i: number, e: React.MouseEvent) => {
      flowStackDispatch({
        type: 'set',
        newflowState: present,
        quadTree: _.cloneDeep(present.nodeIdQuadTree),
      });
      setSelectedIndex(i);
      dispatch({
        type: 'setDraftNode',
        node: {
          ...props.nodeTemplates[i],
          layout: {
            x: (e.pageX - clientRect.x) / scale + viewBound.x,
            y: (e.pageY - clientRect.y) / scale + viewBound.y,
            ...defaultNodeSize,
          },
        },
      });
      startMoving(e);
      e.stopPropagation();
    },
    [
      dispatch,
      startMoving,
      clientRect,
      viewBound,
      scale,
      props.nodeTemplates,
      defaultNodeSize,
      flowStackDispatch,
      present,
    ]
  );

  useEventListener(
    'mouseup',
    useCallback(
      e => {
        if (selectedIndex !== undefined) {
          stopMoving(false);
          if (
            (e.pageX - clientRect.x) / scale < -(defaultNodeSize.w / 2) ||
            (e.pageY - clientRect.y) / scale > clientRect.h - defaultNodeSize.h / 2
          ) {
            dispatch({ type: 'unsetDraftNode', cancel: true });
            flowStackDispatch({ type: 'unset' });
          } else {
            dispatch({ type: 'unsetDraftNode', cancel: false });
          }
          setSelectedIndex(undefined);
        }
      },
      [stopMoving, dispatch, selectedIndex, clientRect, defaultNodeSize, scale, flowStackDispatch]
    )
  );

  useEventListener(
    'mousemove',
    useCallback(
      e => {
        onMoving(e);
      },
      [onMoving]
    )
  );

  return (
    <ul className={Style.toolbox}>
      {props.nodeTemplates.map((tpl, i) => (
        <li
          key={i}
          onMouseDown={e => {
            onMouseDown(i, e);
          }}
        >
          {tpl.title}
        </li>
      ))}
    </ul>
  );
};
