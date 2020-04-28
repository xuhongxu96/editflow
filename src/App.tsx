import React from 'react';
import { Canvas } from 'components/Canvas';
import { Flow, NodeMap, PortMap } from 'models/Flow';
import { toState } from 'states/FlowState';
import { FlowProvider } from 'contexts/FlowContext';
import { Toolbar } from 'components/Toolbar';

const W = 120;
const H = 40;
const Space = 10;
const RowSize = 10;

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
        x: Space + (W + Space) * (i % RowSize),
        y: Space + (H + Space) * Math.floor(i / RowSize),
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
  return (
    <div className='App'>
      <FlowProvider initialState={flowState}>
        <Toolbar />
        <Canvas width='100%' height='600' />
      </FlowProvider>
    </div >
  );
}

export default App;
