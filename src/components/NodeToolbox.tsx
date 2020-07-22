import React, { useCallback, useState } from 'react';
import Style from './NodeToolbox.module.css';
import { NodeTemplate } from 'models/NodeTemplate';
import { useFlowDispatchContext, useFlowContext } from 'contexts/FlowContext';
import { useMoving, useEventListener } from 'hooks';

export interface NodeToolboxProps {
    nodeTemplates: NodeTemplate[];
}

export const NodeToolbox: React.FC<NodeToolboxProps> = (props) => {
    const { clientRect, viewBound, scale } = useFlowContext();
    const dispatch = useFlowDispatchContext();
    const [selectedIndex, setSelectedIndex] = useState<number>();

    const [startMoving, stopMoving, onMoving] = useMoving(useCallback((offset) => {
        if (selectedIndex !== undefined) {
            dispatch({ type: 'moveDraftNode', offset: { x: offset.x / scale, y: offset.y / scale } });
        }
    }, [dispatch, selectedIndex, scale]))

    const onMouseDown = useCallback((i: number, e: React.MouseEvent) => {
        console.log(clientRect, viewBound)
        setSelectedIndex(i);
        dispatch({
            type: 'setDraftNode',
            node: {
                ...props.nodeTemplates[i],
                layout: {
                    x: (e.pageX - clientRect.x) / scale + viewBound.x,
                    y: (e.pageY - clientRect.y) / scale + viewBound.y,
                    w: 100,
                    h: 30,
                }
            }
        });
        startMoving(e);
        e.stopPropagation();
    }, [dispatch, startMoving, clientRect, viewBound, scale, props.nodeTemplates]);

    useEventListener('mouseup', useCallback(e => {
        if (selectedIndex !== undefined) {
            stopMoving(false);
            dispatch({ type: 'unsetDraftNode', cancel: false });
            setSelectedIndex(undefined);
        }
    }, [stopMoving, dispatch, selectedIndex]));

    useEventListener('mousemove', useCallback(e => {
        onMoving(e);
    }, [onMoving]));

    return (
        <ul className={Style.toolbox}>
            {props.nodeTemplates.map((tpl, i) => (
                <li key={i}
                    onMouseDown={e => { onMouseDown(i, e); }}
                >{tpl.title}</li>
            ))}
        </ul>
    );
};