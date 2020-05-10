import React from 'react';
import { useFlowDispatch } from 'contexts/FlowContext';
import Style from './Toolbar.module.css';

export const Toolbar: React.FC<React.PropsWithChildren<{}>> = (props) => {
    const dispatch = useFlowDispatch();

    return (
        <div className={Style.toolbar} id="toolbar">
            <button onClick={() => dispatch({ type: 'setViewOffset', offset: { x: 0, y: 0 } })}>
                Back to origin
            </button>
            <button onClick={() => dispatch({ type: 'setScale', scale: 1 })}>
                x1
            </button>
            <button onClick={() => dispatch({ type: 'setScale', scale: 2 })}>
                x2
            </button>
            {props.children}
        </div >
    );
}