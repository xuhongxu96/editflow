import React from 'react';
import Style from './PortBox.module.css';
import * as Flow from 'models/Flow';

export interface PortProps {
    className: string;
    title: string;
    x: string | number;
    y: string | number;
    r: number;
    cursor: string;
    onMouseDown?: (e: React.MouseEvent) => void;
}

export const Port = React.memo((props: PortProps) => {
    return (
        <circle
            className={props.className}
            cursor={props.cursor}
            cx={props.x}
            cy={props.y}
            r={props.r}
            onMouseDown={props.onMouseDown}
        >
            <title>{props.title}</title>
        </circle>
    );
});

export interface PortBoxProps extends Pick<Flow.Node, 'input' | 'output'> {
    onPortMouseDown?: (e: React.MouseEvent, type: 'input' | 'output', key: Flow.Port, index: number) => void;
}

export const PortBox = React.memo<PortBoxProps>((props) => {
    const inputOffsetUnit = 100 / (Object.keys(props.input).length + 1);
    const outputOffsetUnit = 100 / (Object.keys(props.output).length + 1);

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            className={Style.portBox}
        >

            {props.input.map((port, i) => (
                <Port
                    className={Style.inputPort}
                    key={port.name}
                    title={port.name}
                    x={`${inputOffsetUnit * (i + 1)}%`}
                    y="0"
                    r={3}
                    cursor="pointer"
                    onMouseDown={e => {
                        props.onPortMouseDown && props.onPortMouseDown(e, 'input', port, i);
                        e.stopPropagation();
                    }}
                />
            ))}

            {props.output.map((port, i) => (
                <Port
                    className={Style.outputPort}
                    key={port.name}
                    title={port.name}
                    x={`${outputOffsetUnit * (i + 1)}%`}
                    y="100%"
                    r={3}
                    cursor="pointer"
                    onMouseDown={e => {
                        props.onPortMouseDown && props.onPortMouseDown(e, 'output', port, i);
                        e.stopPropagation();
                    }}
                />
            ))}
        </svg>
    );
});