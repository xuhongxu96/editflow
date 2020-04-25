import React, { useContext, useCallback } from 'react';
import Style from './Node.module.css';
import { PortBox } from './PortBox';
import * as Flow from 'models/Flow';
import { HandleBox } from './HandleBox';
import { FlowDispatchContext } from 'contexts/FlowContext';

export interface NodeProps extends Flow.Node {
    id: string;
    selected: boolean;
}

export const Node = React.memo((props: NodeProps) => {
    const dispatch = useContext(FlowDispatchContext)

    const onMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        dispatch({
            type: 'setSelectNodes',
            ids: [props.id],
        });
        e.stopPropagation();
    }, [props.id, dispatch]);

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            id={props.id}
            className={Style.node + (props.selected ? " selected" : "")}
            x={props.x}
            y={props.y}
            width={props.w}
            height={props.h}
            onMouseDown={onMouseDown}
        >
            <rect className={Style.nodeRect} width='100%' height='100%' rx={4} ry={4} />

            <svg xmlns='http://www.w3.org/2000/svg'>
                <text className={Style.nodeText} x='50%' y='50%' >
                    {props.title}
                </text>
            </svg >

            <PortBox input={props.input} output={props.output} />

            {props.selected &&
                <HandleBox
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    onHandleMouseDown={() => { }}
                />
            }
        </svg>
    );
});
