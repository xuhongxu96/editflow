import React from 'react';
import { Canvas } from 'components/Canvas';
import { Flow } from 'flow/Flow';
import { toState } from 'components/states';

const W = 120;
const H = 40;
const Space = 10;

const generatePorts = (namePrefix: string, n: number) => {
  return Array.from(Array(n).keys()).map((i) => ({
    name: `${namePrefix} ${i}`,
    type: 'null',
  }));
}

const flow: Flow = {
  nodes: Array.from(Array(5).keys()).map(i => (
    {
      id: i.toString(),
      x: Space,
      y: Space + (H + Space) * i,
      width: W,
      height: H,
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
      <Canvas width='100%' height='700' flow={flowState} />
    </div>
  );
}

export default App;
