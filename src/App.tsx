import React from 'react';
import { Canvas } from 'components/Canvas';
import { Flow } from 'flow/Flow';
import { toState } from 'components/states';

const flow: Flow = {
  nodes: [
    {
      id: '1',
      x: 10,
      y: 10,
      width: 100,
      height: 30,
      title: 'Component 1',
      input: [],
      output: [],
    },
    {
      id: '2',
      x: 10,
      y: 50,
      width: 100,
      height: 30,
      title: 'Component 2',
      input: [],
      output: [],
    }
  ],
  edges: [],
};

const flowState = toState(flow);

const App: React.FC = () => {

  return (
    <div className='App'>
      <Canvas width='300' height='300' flow={flowState} />
    </div>
  );
}

export default App;
