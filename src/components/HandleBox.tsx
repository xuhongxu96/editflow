import React from 'react';
import Style from './HandleBox.module.css';

export const HandleBody: React.FC = (props) => {
    const r = 6;

    return (
        <rect
            className={Style.handle}
            x={-r / 2}
            y={-r / 2}
            width={r}
            height={r}
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

    handleBody?: React.FC;
}

export const HandleBox: React.FC<HandleBoxProps> = (props) => {
    const MyHandleBody = props.handleBody || HandleBody;
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
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className={Style.handleWrapper}
                    key={p[0]}
                    cursor={p[1][2]}
                    x={p[1][0]}
                    y={p[1][1]}
                    onMouseDown={e => {
                        props.onHandleMouseDown(e, p[1][3] as HandleDirection);
                        e.stopPropagation();
                    }}
                >
                    <MyHandleBody />
                </svg>
            )
            }

        </svg >
    );
}