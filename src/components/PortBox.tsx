import React from 'react';
import Style from './PortBox.module.css';
import * as Flow from 'models/Flow';

export interface PortProps {
    className: string;
    title: string;
    x: string | number;
    y: string | number;
    disabled?: boolean;
    cursor: string;
    onMouseDown?: (e: React.MouseEvent) => void;
    onMouseUp?: (e: React.MouseEvent) => void;
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
}

export const Port = React.memo((props: PortProps) => {
    return (
        <circle
            className={props.className + (props.disabled ? ' disabled' : '')}
            cursor={props.cursor}
            cx={props.x}
            cy={props.y}
            r={3}
            onMouseDown={props.onMouseDown}
            onMouseUp={props.onMouseUp}
            onMouseEnter={props.onMouseEnter}
            onMouseLeave={props.onMouseLeave}
        >
            <title>{props.title}</title>
        </circle>
    );
});

export type OnPortMouseEventListener = (e: React.MouseEvent, port: Flow.Port, type: 'input' | 'output', index: number) => void;

export interface PortBoxProps extends Pick<Flow.Node, 'input' | 'output'> {
    enableCallback?: (port: Flow.Port, type: 'input' | 'output', index: number) => boolean;
    onPortMouseDown?: OnPortMouseEventListener;
    onPortMouseUp?: OnPortMouseEventListener;
    onPortMouseEnter?: OnPortMouseEventListener;
    onPortMouseLeave?: OnPortMouseEventListener;
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
                    title={`${port.name}: ${port.type}`}
                    disabled={props.enableCallback && !props.enableCallback(port, 'input', i)}
                    x={`${inputOffsetUnit * (i + 1)}%`}
                    y="0"
                    cursor="pointer"
                    onMouseDown={e => {
                        props.onPortMouseDown && props.onPortMouseDown(e, port, 'input', i);
                        e.stopPropagation();
                    }}
                    onMouseUp={e => {
                        props.onPortMouseUp && props.onPortMouseUp(e, port, 'input', i);
                    }}
                    onMouseEnter={e => {
                        props.onPortMouseEnter && props.onPortMouseEnter(e, port, 'input', i);
                    }}
                    onMouseLeave={e => {
                        props.onPortMouseLeave && props.onPortMouseLeave(e, port, 'input', i);
                    }}
                />
            ))}

            {props.output.map((port, i) => (
                <Port
                    className={Style.outputPort}
                    key={port.name}
                    title={`${port.name}: ${port.type}`}
                    disabled={props.enableCallback && !props.enableCallback(port, 'output', i)}
                    x={`${outputOffsetUnit * (i + 1)}%`}
                    y="100%"
                    cursor="pointer"
                    onMouseDown={e => {
                        props.onPortMouseDown && props.onPortMouseDown(e, port, 'output', i);
                        e.stopPropagation();
                    }}
                    onMouseUp={e => {
                        props.onPortMouseUp && props.onPortMouseUp(e, port, 'output', i);
                    }}
                    onMouseEnter={e => {
                        props.onPortMouseEnter && props.onPortMouseEnter(e, port, 'output', i);
                    }}
                    onMouseLeave={e => {
                        props.onPortMouseLeave && props.onPortMouseLeave(e, port, 'output', i);
                    }}
                />
            ))}
        </svg>
    );
});