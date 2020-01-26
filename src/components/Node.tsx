import React from 'react';
import Style from './Node.module.css';
import { INodeState } from './states';
import { PortBox } from './PortBox';

export interface NodeBodyProps {
    title: string;
}

const NodeBody = React.memo<NodeBodyProps>((props) => {
    return (
        <>
            <rect className={Style.nodeRect} width='100%' height='100%' />

            <svg xmlns='http://www.w3.org/2000/svg'>
                <text className={Style.nodeText} x='50%' y='50%' >
                    {props.title}
                </text>
            </svg >
        </>
    );
});

export interface NodeProps extends INodeState {
    selected: boolean,

    onMouseDown: (e: React.MouseEvent, node: INodeState) => void;

    nodeBody?: React.FC<NodeBodyProps>;
}

export const Node = React.memo<NodeProps>((props) => {
    const MyNodeBody = props.nodeBody || NodeBody;

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            id={props.id}
            className={Style.node + (props.selected ? " selected" : "")}
            x={props.x}
            y={props.y}
            width={props.width}
            height={props.height}
            onMouseDown={e => {
                props.onMouseDown(e, props);
                e.stopPropagation();
            }}
        >
            <MyNodeBody title={props.title} />

            <PortBox input={props.input} output={props.output} />
        </svg>
    );
});
