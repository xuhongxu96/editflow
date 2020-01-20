import React from 'react';
import Style from './Node.module.css';
import { Handle, HandleProps } from './Handle';
import { INodeState } from './states';

export interface NodeBodyProps {
    title: string;
}

const NodeBody: React.FC<NodeBodyProps> = (props) => {
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
}

export interface NodeProps extends INodeState {
    selected: boolean,

    handle?: React.FC<HandleProps>;
    onMouseDown: (e: React.MouseEvent) => void;
}

const handlePositions = [
    ['0', '0', 'nwse-resize'],
    ['0', '50%', 'ew-resize'],
    ['0', '100%', 'nesw-resize'],
    ['100%', '0', 'nesw-resize'],
    ['100%', '50%', 'ew-resize'],
    ['100%', '100%', 'nwse-resize'],
];

export const Node: React.FC<NodeProps> = (props) => {
    const MyHandle = props.handle || Handle;

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            id={props.id}
            className={Style.node}
            x={props.x}
            y={props.y}
            width={props.width}
            height={props.height}
            onMouseDown={e => {
                props.onMouseDown(e);
                e.stopPropagation();
            }}
        >

            <NodeBody title={props.title} />

            {Array.from(handlePositions.entries()).map(p =>
                <MyHandle
                    key={p[0]}
                    visible={props.selected}
                    cursor={p[1][2]}
                    x={p[1][0]}
                    y={p[1][1]}
                    r='3' />
            )}

        </svg>
    );
}
