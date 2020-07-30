import { Flow } from 'models/Flow';
import { FlowDispatch, makeFlowReducer } from 'reducers/FlowReducer';
import { FlowState, EmptyFlowState } from 'models/FlowState';
import { CanvasStyleContext } from 'contexts/CanvasStyleContext';
import { useContext, useMemo, useEffect } from 'react';
import { useImmerReducer } from 'use-immer';

export const useFlowState = (flow: Flow): [FlowState, FlowDispatch] => {
  const canvasStyle = useContext(CanvasStyleContext);
  const reducer = useMemo(() => makeFlowReducer(canvasStyle), [canvasStyle]);
  const [flowState, dispatch] = useImmerReducer(reducer, EmptyFlowState);
  useEffect(() => dispatch({ type: 'init', flow: flow }), [flow, dispatch]);
  return [flowState, dispatch];
};
