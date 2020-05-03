import React from "react";
import { Size } from "models/BasicTypes";

export interface CanvasStyle {
    margin: number;
    minNodeSize: Size;
}

export const DefaultCanvasStyle = {
    margin: 32,
    minNodeSize: {
        w: 60,
        h: 20,
    }
}

export const CanvasStyleContext = React.createContext<CanvasStyle>(DefaultCanvasStyle);

export const CanvasStyleProvider: React.FC<React.PropsWithChildren<{ style?: CanvasStyle }>> = (props) => {
    return (
        <CanvasStyleContext.Provider value={props.style || DefaultCanvasStyle}>
            {props.children}
        </CanvasStyleContext.Provider>
    );
}