import React, { useContext } from 'react';
import { FlowDispatch } from 'reducers/FlowReducer';
import { FlowStackDispatch } from 'reducers/FlowStackReducer';
import { EmptyFlowStack, FlowStack } from 'models/FlowState';

const FlowDispatchContext = React.createContext<FlowDispatch>(() => {});
const FlowStackContext = React.createContext<FlowStack>(EmptyFlowStack);
const FlowStackDispatchContext = React.createContext<FlowStackDispatch>(() => {});

export const FlowProvider: React.FC<React.PropsWithChildren<{
  dispatch: FlowDispatch;
  flowStack: FlowStack;
  flowStackDispatch: FlowStackDispatch;
}>> = props => {
  const { dispatch, flowStack, flowStackDispatch, children } = props;

  return (
    <FlowStackDispatchContext.Provider value={flowStackDispatch}>
      <FlowDispatchContext.Provider value={dispatch}>
        <FlowStackContext.Provider value={flowStack}>{children}</FlowStackContext.Provider>
      </FlowDispatchContext.Provider>
    </FlowStackDispatchContext.Provider>
  );
};

export const useFlowStackContext = () => {
  return useContext(FlowStackContext);
};

export const useFlowStackDispatchContext = () => {
  return useContext(FlowStackDispatchContext);
};

export const useFlowDispatchContext = () => {
  return useContext(FlowDispatchContext);
};
