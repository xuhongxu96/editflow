import React from 'react';
import Style from './HandleBox.module.css';

export type HandleDirection = 'left-top' | 'left-middle' | 'left-bottom' | 'right-top' | 'right-middle' | 'right-bottom';

interface HandleMeta {
    x: string;
    y: string;
    cursor: string;
    direction: HandleDirection;
}

const handleMetas: HandleMeta[] = [
    { x: '0', y: '0', cursor: 'nwse-resize', direction: 'left-top' },
    { x: '0', y: '50%', cursor: 'ew-resize', direction: 'left-middle' },
    { x: '0', y: '100%', cursor: 'nesw-resize', direction: 'left-bottom' },
    { x: '100%', y: '0', cursor: 'nesw-resize', direction: 'right-top' },
    { x: '100%', y: '50%', cursor: 'ew-resize', direction: 'right-middle' },
    { x: '100%', y: '100%', cursor: 'nwse-resize', direction: 'right-bottom' },
];

export interface HandleBoxProps {
    x: number;
    y: number;
    width: number;
    height: number;
    visible?: boolean;

    onHandleMouseDown: (e: React.MouseEvent, direction: HandleDirection) => void;
}

export const HandleBox = React.memo<HandleBoxProps>((props) => {
    const visible = props.visible === undefined ? true : props.visible;
    const r = 6;

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
            {handleMetas.map(p =>
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className={Style.handleWrapper}
                    key={p.direction}
                    cursor={p.cursor}
                    x={p.x}
                    y={p.y}
                    onMouseDown={e => {
                        props.onHandleMouseDown(e, p.direction);
                        e.stopPropagation();
                    }}>
                    <rect
                        className={Style.handle}
                        x={-r / 2}
                        y={-r / 2}
                        width={r}
                        height={r} />
                </svg>
            )
            }

        </svg >
    );
});