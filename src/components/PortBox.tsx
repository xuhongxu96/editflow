import React, { useCallback } from 'react';
import Style from './PortBox.module.css';
import * as Flow from 'models/Flow';

export interface PortProps {
    className: string;
    x: string | number;
    y: string | number;
    r: number;
    cursor: string;
    onMouseDown: (e: React.MouseEvent) => void;
}

export const Port: React.FC<PortProps> = (props) => {
    return (
        <circle
            className={props.className}
            cursor={props.cursor}
            cx={props.x}
            cy={props.y}
            r={props.r}
            onMouseDown={props.onMouseDown}
        />
    );
}

export interface PortBoxProps extends Pick<Flow.Node, 'input' | 'output'> {
}

export const PortBox = React.memo<PortBoxProps>((props) => {
    const inputOffsetUnit = 100 / (Object.keys(props.input).length + 1);
    const outputOffsetUnit = 100 / (Object.keys(props.output).length + 1);

    const onPortMouseDown = useCallback(e => {
        e.stopPropagation();
    }, []);

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            className={Style.portBox}
        >

            {Object.keys(props.input).map((k, i) => (
                <Port
                    className={Style.inputPort}
                    key={k}
                    x={`${inputOffsetUnit * (i + 1)}%`}
                    y="0"
                    r={3}
                    cursor="pointer"
                    onMouseDown={onPortMouseDown}
                />
            ))}

            {Object.keys(props.output).map((k, i) => (
                <Port
                    className={Style.outputPort}
                    key={k}
                    x={`${outputOffsetUnit * (i + 1)}%`}
                    y="100%"
                    r={3}
                    cursor="pointer"
                    onMouseDown={onPortMouseDown}
                />
            ))}
        </svg>
    );
});