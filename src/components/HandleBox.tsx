import React from 'react';
import Style from './HandleBox.module.css';

export interface HandleProps {
    x: string | number;
    y: string | number;
    r: string | number;
    cursor: string;
    onMouseDown: (e: React.MouseEvent) => void;
}

export const Handle: React.FC<HandleProps> = (props) => {
    return (
        <circle
            className={Style.handle}
            cursor={props.cursor}
            cx={props.x}
            cy={props.y}
            r={props.r}
            onMouseDown={props.onMouseDown}
        />
    );
}


const handlePositions = [
    ['0', '0', 'nwse-resize', 'left-top'],
    ['0', '50%', 'ew-resize', 'left-middle'],
    ['0', '100%', 'nesw-resize', 'left-bottom'],
    ['100%', '0', 'nesw-resize', 'right-top'],
    ['100%', '50%', 'ew-resize', 'right-middle'],
    ['100%', '100%', 'nwse-resize', 'right-bottom'],
];

export type HandleDirection = 'left-top' | 'left-middle' | 'left-bottom' | 'right-top' | 'right-middle' | 'right-bottom';

export interface HandleBoxProps {
    x: number;
    y: number;
    width: number;
    height: number;
    visible?: boolean;

    onHandleMouseDown: (e: React.MouseEvent, direction: HandleDirection) => void;

    handle?: React.FC<HandleProps>;
}

export const HandleBox: React.FC<HandleBoxProps> = (props) => {
    const MyHandle = props.handle || Handle;
    const visible = props.visible === undefined ? true : props.visible;

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            className={Style.handleBox}
            visibility={visible ? 'visible' : 'hidden'}
            x={props.x}
            y={props.y}
            width={props.width}
            height={props.height}
        >
            {Array.from(handlePositions.entries()).map(p =>
                <MyHandle
                    key={p[0]}
                    cursor={p[1][2]}
                    x={p[1][0]}
                    y={p[1][1]}
                    r='3'
                    onMouseDown={e => {
                        props.onHandleMouseDown(e, p[1][3] as HandleDirection);
                        e.stopPropagation();
                    }}
                />
            )}

        </svg>
    );
}