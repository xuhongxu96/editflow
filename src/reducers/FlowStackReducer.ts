import { FlowStack, FlowState } from 'models/FlowState';
import { valueof } from 'utils';
import { Reducer } from 'use-immer';
import { Draft } from 'immer';
import { Dispatch } from 'react';
import { QuadTree } from 'algorithms/quadtree';

type DraftFlowStack = Draft<FlowStack>;

function deepCloneClass(instance: QuadTree<string>) {
  return Object.assign(
    Object.create(Object.getPrototypeOf(instance)),
    JSON.parse(JSON.stringify(instance))
  );
}

const reducers = {
  init: (draft: DraftFlowStack, action: { flowState: FlowState }) => {
    const { flowState } = action;
    draft.present = flowState;
  },
  set: (draft: DraftFlowStack, action: { newflowState: FlowState; quadTree: QuadTree<string> }) => {
    const { newflowState, quadTree } = action;
    draft.past = [...draft.past, { ...draft.present, nodeIdQuadTree: deepCloneClass(quadTree) }];
    draft.present = newflowState;
    draft.future = [];
  },
  unset: (draft: DraftFlowStack, action: {} = {}) => {
    draft.update = draft.past[draft.past.length - 1];
    draft.past = draft.past.slice(0, draft.past.length - 1);
  },
  undo: (draft: DraftFlowStack, action: {} = {}) => {
    if (draft.past.length !== 0) {
      const previous = draft.past[draft.past.length - 1];
      draft.past = draft.past.slice(0, draft.past.length - 1);
      draft.future = [draft.present, ...draft.future];
      draft.present = previous;
      draft.update = previous;
    }
  },
  redo: (draft: DraftFlowStack, action: {} = {}) => {
    if (draft.future.length !== 0) {
      const next = draft.future[0];
      draft.past = [...draft.past, draft.present];
      draft.future = draft.future.slice(1);
      draft.present = next;
      draft.update = next;
    }
  },
};

export type FlowStackAction = valueof<
  { [K in keyof typeof reducers]: { type: K } & Parameters<typeof reducers[K]>[1] }
>;
export type FlowStackDispatch = Dispatch<FlowStackAction>;
export type FlowStackReducer = Reducer<FlowStack, FlowStackAction>;

export const makeFlowStackReducer = (): FlowStackReducer => {
  return (draft: Draft<FlowStack>, action: FlowStackAction) => {
    return reducers[action.type](draft, action as any);
  };
};
