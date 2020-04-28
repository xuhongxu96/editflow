import React from 'react';
import { useFlowDispatch } from 'contexts/FlowContext';

export const Toolbar: React.FC = () => {
    const dispatch = useFlowDispatch();

    return (
        <div id="toolbar" style={{ margin: '8px 16px' }}>
            <button onClick={() => dispatch({ type: 'setViewOffset', offset: { x: 0, y: 0 } })}>
                Back to origin
            </button>
            <button onClick={() => dispatch({ type: 'setScale', scale: 1 })}>
                x1
            </button>
            <button onClick={() => dispatch({ type: 'setScale', scale: 2 })}>
                x2
            </button>
        </div>
    );
}