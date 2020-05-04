
import React from 'react';
import Style from './Edge.module.css';
import { EdgeState } from 'states/FlowState';

export interface EdgeProps extends EdgeState {
}

export const Edge = React.memo((props: EdgeProps) => {
    return (
        <line
            className={Style.edge}
            x1={props.start.x}
            y1={props.start.y}
            x2={props.end.x}
            y2={props.end.y}
        />
    );
});