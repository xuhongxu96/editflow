import React from "react";
import { EmptyFlowState, FlowState } from "states/FlowState";
import { FlowDispatch } from "reducers/FlowReducer";

export const FlowContext = React.createContext<FlowState>(EmptyFlowState);
export const FlowDispatchContext = React.createContext<FlowDispatch>(() => { })