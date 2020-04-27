import React from 'react';
import { Canvas } from 'components/Canvas';
import { Flow, NodeMap, PortMap } from 'models/Flow';
import { toState } from 'states/FlowState';
import { FlowContext, FlowDispatchContext } from 'contexts/FlowContext';
import { useImmerReducer } from 'use-immer';
import { FlowReducer } from 'reducers/FlowReducer';

const W = 120;
const H = 40;
const Space = 10;
const ColSize = 10;

const generatePorts = (namePrefix: string, n: number) => {
  return Array.from(Array(n).keys()).reduce((o, i) => {
    o[`${namePrefix} ${i}`] = {
      type: 'null',
    };
    return o;
  }, {} as PortMap);
}

const flow: Flow = {
  nodes: Array.from(Array(1000).keys()).reduce((o, i) => {
    o[i] = {
      layout: {
        x: Space + (W + Space) * Math.floor(i / ColSize),
        y: Space + (H + Space) * (i % ColSize),
        w: W,
        h: H,
      },
      title: `Component ${i}`,
      input: generatePorts("In", Math.round(Math.random() * 8) + 2),
      output: generatePorts("Out", Math.round(Math.random() * 8) + 2),
    };
    return o;
  }, {} as NodeMap),
  edges: {},
};

const flowState = toState(flow);

const App: React.FC = () => {
  const [flow, dispatch] = useImmerReducer(FlowReducer, flowState);

  return (
    <div className='App'>
      <FlowContext.Provider value={flow}>
        <FlowDispatchContext.Provider value={dispatch}>

          <div id="toolbar" style={{ margin: '8px 16px' }}>
            <button onClick={() => dispatch({ type: 'setOffset', offset: { x: 0, y: 0 } })}>
              Back to origin
            </button>
            <button onClick={() => dispatch({ type: 'setScale', scale: 1 })}>
              x1
            </button>
            <button onClick={() => dispatch({ type: 'setScale', scale: 2 })}>
              x2
            </button>
          </div>

          <Canvas width='100%' height='600' />

        </FlowDispatchContext.Provider>
      </FlowContext.Provider>
    </div >
  );
}

export default App;
