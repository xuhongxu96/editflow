
import React from 'react';
import Style from './Edge.module.css';
import { EdgeState } from 'models/FlowState';

export interface EdgeProps extends EdgeState {
    id: string;
    selected?: boolean;
    onMouseDown?: (e: React.MouseEvent, id: string) => void;
}

export const Edge = React.memo((props: EdgeProps) => {
    return (
        <line
            className={Style.edge + (props.selected ? ' selected' : '')}
            x1={props.start.x}
            y1={props.start.y}
            x2={props.end.x}
            y2={props.end.y}
            onMouseDown={e => props.onMouseDown && props.onMouseDown(e, props.id)}
        />
    );
});