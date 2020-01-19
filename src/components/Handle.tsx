import React from 'react';
import Style from './Handle.module.css';

export interface HandleProps {
    x: string | number;
    y: string | number;
    r: string | number;
    cursor: string;
    visible: boolean;
}

export const Handle: React.FC<HandleProps> = (props) => {
    return (
        <circle
            className={Style.handle}
            visibility={props.visible ? 'visible' : 'hidden'}
            cursor={props.cursor}
            cx={props.x}
            cy={props.y}
            r={props.r}
        />
    );
}
