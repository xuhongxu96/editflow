import React from 'react';
import { CanvasStyle, DefaultCanvasStyle } from 'models/CanvasStyle';

export const CanvasStyleContext = React.createContext<CanvasStyle>(DefaultCanvasStyle);

export const CanvasStyleProvider: React.FC<React.PropsWithChildren<{
  style?: CanvasStyle;
}>> = props => {
  return (
    <CanvasStyleContext.Provider value={props.style || DefaultCanvasStyle}>
      {props.children}
    </CanvasStyleContext.Provider>
  );
};
