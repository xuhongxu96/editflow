import React, { useContext } from 'react';
import { FlowDispatch } from 'reducers/FlowReducer';
import { FlowState, makeFlowState } from 'models/FlowState';

const FlowStateContext = React.createContext<FlowState>(makeFlowState());
const FlowDispatchContext = React.createContext<FlowDispatch>(() => {});

export const FlowProvider: React.FC<React.PropsWithChildren<{
  flowState: FlowState;
  dispatch: FlowDispatch;
}>> = props => {
  const { flowState, dispatch, children } = props;

  return (
    <FlowDispatchContext.Provider value={dispatch}>
      <FlowStateContext.Provider value={flowState}>{children}</FlowStateContext.Provider>
    </FlowDispatchContext.Provider>
  );
};

export const useFlowContext = () => {
  return useContext(FlowStateContext);
};
export const useFlowDispatchContext = () => {
  return useContext(FlowDispatchContext);
};
