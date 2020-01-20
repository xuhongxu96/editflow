import React from 'react';
import { Canvas } from 'components/Canvas';
import { Flow } from 'flow/Flow';
import { toState } from 'components/states';

const flow: Flow = {
  nodes: Array.from(Array(50).keys()).map(i => (
    {
      id: i.toString(),
      x: 10,
      y: 10 + 35 * i,
      width: 100,
      height: 30,
      title: `Component ${i}`,
      input: [],
      output: [],
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
