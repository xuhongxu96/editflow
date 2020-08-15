import React, { useCallback, useState, useContext } from 'react';
import Style from './NodeToolbox.module.css';
import { NodeTemplate } from 'models/NodeTemplate';
import { useFlowDispatchContext, useFlowContext } from 'contexts/FlowContext';
import { useMoving, useEventListener } from 'hooks';
import { CanvasStyleContext } from 'contexts/CanvasStyleContext';

export interface NodeToolboxProps {
  nodeTemplates: NodeTemplate[];
}

export const NodeToolbox: React.FC<NodeToolboxProps> = props => {
  const { clientRect, viewBound, scale } = useFlowContext();
  const { defaultNodeSize } = useContext(CanvasStyleContext);
  const dispatch = useFlowDispatchContext();
  const [selectedIndex, setSelectedIndex] = useState<number>();

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
    [dispatch, startMoving, clientRect, viewBound, scale, props.nodeTemplates, defaultNodeSize]
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
          } else {
            dispatch({ type: 'unsetDraftNode', cancel: false });
          }
          setSelectedIndex(undefined);
        }
      },
      [stopMoving, dispatch, selectedIndex, clientRect, defaultNodeSize, scale]
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

  useEventListener(
    'keydown',
    useCallback(
      e => {
        // Escape will cancel the current moving or resizing and restore the previous layout
        if (e.key === 'Escape') {
          setSelectedIndex(undefined);
          dispatch({ type: 'unsetDraftNode', cancel: true });
        }
      },
      [dispatch]
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
