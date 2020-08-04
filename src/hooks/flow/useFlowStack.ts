import { FlowStackDispatch, makeFlowStackReducer } from 'reducers/FlowStackReducer';
import { FlowState, EmptyFlowStack, FlowStack } from 'models/FlowState';
import { useMemo, useEffect } from 'react';
import { useImmerReducer } from 'use-immer';

export const useFlowStack = (flowState: FlowState): [FlowStack, FlowStackDispatch] => {
  const reducer = useMemo(() => makeFlowStackReducer(), []);
  const [flowStack, flowStackDispatch] = useImmerReducer(reducer, EmptyFlowStack);
  useEffect(() => flowStackDispatch({ type: 'init', flowState: flowState }), [
    flowState,
    flowStackDispatch,
  ]);
  return [flowStack, flowStackDispatch];
};
