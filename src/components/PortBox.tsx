import React from 'react';
import Style from './PortBox.module.css';
import { IPortState } from './states';

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

export interface PortBoxProps {
    input: Map<string, IPortState>;
    output: Map<string, IPortState>;
}

export const PortBox: React.FC<PortBoxProps> = (props) => {
    const inputOffsetUnit = 100 / (props.input.size + 1);
    const outputOffsetUnit = 100 / (props.output.size + 1);

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            className={Style.portBox}
        >

            {Array.from(props.input.keys()).map((k, i) => (
                <Port
                    className={Style.inputPort}
                    key={k}
                    x={`${inputOffsetUnit * (i + 1)}%`}
                    y="0"
                    r={3}
                    cursor="pointer"
                    onMouseDown={() => { }}
                />
            ))}

            {Array.from(props.output.keys()).map((k, i) => (
                <Port
                    className={Style.outputPort}
                    key={k}
                    x={`${outputOffsetUnit * (i + 1)}%`}
                    y="100%"
                    r={3}
                    cursor="pointer"
                    onMouseDown={() => { }}
                />
            ))}
        </svg>
    );
}