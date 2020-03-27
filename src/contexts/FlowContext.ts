import React from "react";
import { EmptyFlowState, FlowState } from "states/FlowState";
import { FlowDispatch } from "reducers/FlowReducer";

export const FlowContext = React.createContext<{ flow: FlowState, dispatch: FlowDispatch }>({
    flow: EmptyFlowState,
    dispatch: (_) => { },
});