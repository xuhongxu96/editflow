import React from "react";
import { Size } from "models/BasicTypes";
import { PortMeta, NodePortEdgeMap } from "models/FlowState";

export interface CanvasStyle {
    margin: number;
    minNodeSize: Size;
    onEdgeAdded?: (startPort: PortMeta, endPort: PortMeta, inputPortEdgeMap: NodePortEdgeMap, outputPortEdgeMap: NodePortEdgeMap) => boolean;
}

export const DefaultCanvasStyle: CanvasStyle = {
    margin: 32,
    minNodeSize: {
        w: 60,
        h: 20,
    },
    onEdgeAdded: (startPort, endPort, inputPortEdgeMap) => {
        return startPort.io === 'output' &&
            endPort.io === 'input' &&
            startPort.raw.type === endPort.raw.type &&
            startPort.nodeId !== endPort.nodeId &&
            inputPortEdgeMap.get(endPort.nodeId)!.get(endPort.raw.name)!.size === 0;
    },
}

export const CanvasStyleContext = React.createContext<CanvasStyle>(DefaultCanvasStyle);

export const CanvasStyleProvider: React.FC<React.PropsWithChildren<{ style?: CanvasStyle }>> = (props) => {
    return (
        <CanvasStyleContext.Provider value={props.style || DefaultCanvasStyle}>
            {props.children}
        </CanvasStyleContext.Provider>
    );
}