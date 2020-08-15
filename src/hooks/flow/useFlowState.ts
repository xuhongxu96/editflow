import { Flow } from 'models/Flow';
import { FlowDispatch, makeFlowReducer } from 'reducers/FlowReducer';
import { FlowState, makeFlowState } from 'models/FlowState';
import { CanvasStyleContext } from 'contexts/CanvasStyleContext';
import { useContext, useMemo, useEffect, useReducer } from 'react';

export const useFlowState = (flow: Flow): [FlowState, FlowDispatch] => {
  const canvasStyle = useContext(CanvasStyleContext);
  const reducer = useMemo(() => makeFlowReducer(canvasStyle), [canvasStyle]);
  const [flowState, dispatch] = useReducer(reducer, makeFlowState());
  useEffect(() => dispatch({ type: 'init', flow: flow }), [flow, dispatch]);
  return [flowState, dispatch];
};
