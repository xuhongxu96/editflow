import React, { useState, useEffect, useRef } from 'react';
import Style from './Edge.module.css';
import { IEdgeState } from 'models/FlowState';

export interface EdgeProps extends IEdgeState {
  id: string;
  highlighted?: boolean;
  selected?: boolean;
  onMouseDown?: (e: React.MouseEvent, id: string) => void;
}

export const Edge = React.memo((props: EdgeProps) => {
  return (
    <line
      className={
        Style.edge + (props.selected ? ' selected' : '') + (props.highlighted ? ' highlighted' : '')
      }
      x1={props.start.x}
      y1={props.start.y}
      x2={props.end.x}
      y2={props.end.y}
      onMouseDown={e => props.onMouseDown && props.onMouseDown(e, props.id)}
    />
  );
});

export interface DraftEdgeProps {
  edge?: IEdgeState;
  connected?: boolean;
}

export const DraftEdge = (props: DraftEdgeProps) => {
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [end, setEnd] = useState({ x: 0, y: 0 });
  const animate1 = useRef<any>(null);
  const animate2 = useRef<any>(null);
  const animate3 = useRef<any>(null);

  useEffect(() => {
    if (props.edge) {
      setStart({ ...props.edge.start });
      setEnd({ ...props.edge.end });
    } else {
      if (animate1.current !== null) animate1.current.beginElement();
      if (animate2.current !== null) animate2.current.beginElement();
      if (animate3.current !== null) animate3.current.beginElement();
    }
  }, [props.edge, animate1, animate2, animate3]);

  const animateProps = {
    keySplines: '0.1 0.8 0.2 1',
    calcMode: 'spline',
    begin: '0',
    dur: '0.4s',
    repeatCount: 1,
    fill: 'freeze',
  };
  const className = Style.edge + ' draft' + (props.connected ? ' connected' : '');
  if (props.edge) {
    return (
      <line
        className={className}
        x1={props.edge.start.x}
        y1={props.edge.start.y}
        x2={props.edge.end.x}
        y2={props.edge.end.y}
      />
    );
  } else {
    return (
      <line className={className} x1={start.x} y1={start.y} x2={end.x} y2={end.y}>
        <animate
          ref={animate1}
          attributeName="x2"
          from={end.x}
          to={start.x}
          values={`${end.x};${start.x}`}
          {...animateProps}
        />
        <animate
          ref={animate2}
          attributeName="y2"
          from={end.y}
          to={start.y}
          values={`${end.y};${start.y}`}
          {...animateProps}
        />
        <animate
          ref={animate3}
          attributeName="opacity"
          from={1}
          to={0}
          values="1;0"
          {...animateProps}
        />
      </line>
    );
  }
};
