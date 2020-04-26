import React, { useContext, useCallback } from 'react';
import Style from './Node.module.css';
import { PortBox } from './PortBox';
import * as Flow from 'models/Flow';
import { HandleBox } from './HandleBox';
import { FlowDispatchContext } from 'contexts/FlowContext';
import { Rect } from 'models/BasicTypes';

export interface NodeProps extends Flow.Node {
    id: string;
    draftLayout?: Rect;
    selected: boolean;
    animated?: boolean;
    onMouseDown?: (e: React.MouseEvent<SVGSVGElement>) => void;
}

export const Node = React.memo((props: NodeProps) => {
    const dispatch = useContext(FlowDispatchContext)

    const {
        id,
        onMouseDown,
        animated,
        selected,
        title,
        input,
        output
    } = props;

    const { x, y } = props.draftLayout || props;
    const { w, h } = props.draftLayout || props;

    const myOnMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (!selected) {
            if (e.ctrlKey) {
                dispatch({ type: 'addSelectNodes', ids: [id] });
            } else {
                dispatch({ type: 'setSelectNodes', ids: [id] });
            }
        }
        onMouseDown && onMouseDown(e);
        e.stopPropagation();
    }, [id, onMouseDown, selected, dispatch]);

    const myOnClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (e.ctrlKey) {
            dispatch({ type: 'unselectNodes', ids: [id] });
        }
    }, [id, dispatch]);


    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            id={id}
            className={Style.node + (animated ? " animated" : "") + (selected ? " selected" : "")}
            x={x}
            y={y}
            width={w}
            height={h}
            onMouseDown={myOnMouseDown}
            onClick={myOnClick}
        >
            <rect className={Style.nodeRect} width='100%' height='100%' rx={4} ry={4} />

            <svg xmlns='http://www.w3.org/2000/svg'>
                <text className={Style.nodeText} x='50%' y='50%' >
                    {title}
                </text>
            </svg >

            <PortBox input={input} output={output} />

            {selected && <HandleBox
                x="0"
                y="0"
                width="100%"
                height="100%"
                onHandleMouseDown={() => { }}
            />}
        </svg >
    );
});
