import React from 'react';
import Style from './Node.module.css';
import { PortBox } from './PortBox';
import * as Flow from 'models/Flow';
import { HandleBox, HandleDirection } from './HandleBox';
import { Rect } from 'models/BasicTypes';

export type OnNodeMouseEventListener = (e: React.MouseEvent, id: string, props: NodeProps) => void;
export type OnNodeHandleMouseDownEventListener = (e: React.MouseEvent, id: string, direction: HandleDirection) => void;
export type OnNodePortMouseEventListener = (e: React.MouseEvent, id: string, port: Flow.Port, io: 'input' | 'output', portIndex: number) => void;

export interface NodeProps extends Flow.Node {
    id: string;
    draftLayout?: Rect;
    selected?: boolean;
    highlighted?: boolean;
    animated?: boolean;
    enabledPortType?: (io: 'input' | 'output', type: string) => boolean;
    onMouseDown?: OnNodeMouseEventListener;
    onMouseEnter?: OnNodeMouseEventListener;
    onMouseLeave?: OnNodeMouseEventListener;
    onClick?: OnNodeMouseEventListener;
    onHandleMouseDown?: OnNodeHandleMouseDownEventListener;
    onPortMouseDown?: OnNodePortMouseEventListener;
    onPortMouseUp?: OnNodePortMouseEventListener;
    onPortMouseEnter?: OnNodePortMouseEventListener;
    onPortMouseLeave?: OnNodePortMouseEventListener;
}

export const Node = React.memo((props: NodeProps) => {
    const {
        id,
        onClick,
        onMouseDown,
        onMouseEnter,
        onMouseLeave,
        onHandleMouseDown,
        onPortMouseDown,
        onPortMouseUp,
        onPortMouseEnter,
        onPortMouseLeave,
        enabledPortType,
        animated,
        highlighted,
        selected,
        title,
        input,
        output,
    } = props;

    const { x, y, w, h } = props.draftLayout || props.layout;

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            id={id}
            className={Style.node
                + (animated ? " animated" : "")
                + (highlighted ? " highlighted" : "")
                + (selected ? " selected" : "")}
            x={x}
            y={y}
            width={w}
            height={h}
            onMouseDown={e => onMouseDown && onMouseDown(e, id, props)}
            onMouseEnter={e => onMouseEnter && onMouseEnter(e, id, props)}
            onMouseLeave={e => onMouseLeave && onMouseLeave(e, id, props)}
            onClick={e => onClick && onClick(e, id, props)}
        >
            <rect className={Style.nodeRect} width='100%' height='100%' rx={4} ry={4} />

            <svg xmlns='http://www.w3.org/2000/svg'>
                <text className={Style.nodeText} x='50%' y='50%' >
                    {title}
                </text>
            </svg >

            <PortBox
                input={input}
                output={output}
                onPortMouseDown={(e, port, type, index) => onPortMouseDown && onPortMouseDown(e, id, port, type, index)}
                onPortMouseUp={(e, port, type, index) => onPortMouseUp && onPortMouseUp(e, id, port, type, index)}
                onPortMouseEnter={(e, port, type, index) => onPortMouseEnter && onPortMouseEnter(e, id, port, type, index)}
                onPortMouseLeave={(e, port, type, index) => onPortMouseLeave && onPortMouseLeave(e, id, port, type, index)}
                enabledType={enabledPortType}
            />

            {
                selected && <HandleBox
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    onHandleMouseDown={(e, d) => onHandleMouseDown && onHandleMouseDown(e, id, d)}
                />
            }
        </svg >
    );
});
