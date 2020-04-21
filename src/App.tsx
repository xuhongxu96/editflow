import React from 'react';
import { Canvas } from 'components/Canvas';
import { Flow } from 'models/Flow';
import { toState } from 'states/FlowState';

const W = 120;
const H = 40;
const Space = 10;
const ColSize = 500;

const generatePorts = (namePrefix: string, n: number) => {
  return Array.from(Array(n).keys()).map((i) => ({
    name: `${namePrefix} ${i}`,
    type: 'null',
  }));
}

const flow: Flow = {
  nodes: Array.from(Array(100000).keys()).map(i => (
    {
      id: i.toString(),
      x: Space + (W + Space) * Math.floor(i / ColSize),
      y: Space + (H + Space) * (i % ColSize),
      w: W,
      h: H,
      title: `Component ${i}`,
      input: generatePorts("In", 10),
      output: generatePorts("Out", 3),
    })),
  edges: [],
};

const flowState = toState(flow);

const App: React.FC = () => {

  return (
    <div className='App'>
      <Canvas width='100%' height='600' flow={flowState} />
    </div>
  );
}

export default App;
