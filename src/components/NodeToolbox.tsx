import React from 'react';
import Style from './NodeToolbox.module.css';
import { NodeTemplate } from 'models/NodeTemplate';

export interface NodeToolboxProps {
    nodeTemplates: NodeTemplate[];
}

export const NodeToolbox: React.FC<NodeToolboxProps> = (props) => {
    return (
        <ul className={Style.toolbox}>
            {props.nodeTemplates.map((tpl, i) => (
                <li key={i} onMouseDown={undefined}>{tpl.title}</li>
            ))}
        </ul>
    );
};