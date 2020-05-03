import React, { useCallback } from 'react';
import Style from './Node.module.css';
import { PortBox } from './PortBox';
import * as Flow from 'models/Flow';
import { HandleBox, HandleDirection } from './HandleBox';
import { useFlowDispatch } from 'contexts/FlowContext';
import { Rect } from 'models/BasicTypes';

export interface NodeProps extends Flow.Node {
    id: string;
    draftLayout?: Rect;
    selected: boolean;
    animated?: boolean;
    onMouseDown?: (e: React.MouseEvent<SVGSVGElement>) => void;
    onHandleMouseDown?: (e: React.MouseEvent, direction: HandleDirection) => void;
}

export const Node = React.memo((props: NodeProps) => {
    const dispatch = useFlowDispatch();

    const {
        id,
        onMouseDown,
        onHandleMouseDown,
        animated,
        selected,
        title,
        input,
        output,
    } = props;

    const { x, y, w, h } = props.draftLayout || props.layout;

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
        // No need to check if it is selected here, because when node is selected,
        // it will be moved from visibleNodes to selectedNodes, and the click event won't be triggered.
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
                onHandleMouseDown={onHandleMouseDown}
            />}
        </svg >
    );
});
