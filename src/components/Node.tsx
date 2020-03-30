import React from 'react';
import Style from './Node.module.css';
import { PortBox } from './PortBox';
import * as Flow from 'models/Flow';

export interface NodeProps extends Flow.Node {
    selected: boolean;
    onMouseDown?: (e: React.MouseEvent, node: NodeProps) => void;
}

export const Node = React.memo((props: NodeProps) => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            id={props.id}
            className={Style.node + (props.selected ? " selected" : "")}
            x={props.x}
            y={props.y}
            width={props.w}
            height={props.h}
            onMouseDown={e => {
                props.onMouseDown && props.onMouseDown(e, props);
                e.stopPropagation();
            }}
        >
            <rect className={Style.nodeRect} width='100%' height='100%' rx={4} ry={4} />

            <svg xmlns='http://www.w3.org/2000/svg'>
                <text className={Style.nodeText} x='50%' y='50%' >
                    {props.title}
                </text>
            </svg >

            <PortBox input={props.input} output={props.output} />
        </svg>
    );
});
