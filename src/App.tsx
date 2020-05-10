import React, { useState } from 'react';
import { Canvas } from 'components/Canvas';
import { Flow, NodeMap, EdgeMap } from 'models/Flow';
import { FlowProvider, useFlowState } from 'contexts/FlowContext';
import { Toolbar } from 'components/Toolbar';
import { CanvasStyleProvider } from 'contexts/CanvasStyleContext';

const W = 120;
const H = 40;
const Space = 10;
const RowSize = 10;
const OffsetX = 0;
const OffsetY = 48;
const NodeCount = 1000;
const EdgeCount = 50;

const generatePorts = (namePrefix: string, n: number) => {
  return Array.from(Array(n).keys()).map((_, i) => ({
    name: `${namePrefix} ${i}`,
    type: 'null',
  }));
}

const genFlow = (): Flow => {
  return {
    nodes: Array.from(Array(NodeCount).keys()).reduce((o, i) => {
      o[`node-${i}`] = {
        layout: {
          x: OffsetX + Space + (W + Space) * (i % RowSize),
          y: OffsetY + Space + (H + Space) * Math.trunc(i / RowSize),
          w: W,
          h: H,
        },
        title: `Component ${i}`,
        input: generatePorts("In", Math.trunc(Math.random() * 8) + 2),
        output: generatePorts("Out", Math.trunc(Math.random() * 8) + 2),
      };
      return o;
    }, {} as NodeMap),
    edges: Array.from(Array(EdgeCount).keys()).reduce((o, i) => {
      o[`edge-${i}`] = {
        start: {
          nodeId: `node-${Math.trunc(Math.random() * NodeCount)}`,
          portName: `Out ${Math.trunc(Math.random() * 2)}`,
        },
        end: {
          nodeId: `node-${Math.trunc(Math.random() * NodeCount)}`,
          portName: `In ${Math.trunc(Math.random() * 2)}`,
        },
      };
      return o;
    }, {} as EdgeMap),
  };
}

const App: React.FC = () => {
  const [flow, setFlow] = useState(genFlow());
  const [flowState, dispatch] = useFlowState(flow);

  return (
    <div className='App' style={{ display: 'flex' }}>
      <CanvasStyleProvider>
        <FlowProvider flowState={flowState} dispatch={dispatch}>
          <Canvas width='80%' height='600' />
          <Toolbar>
            <button onClick={() => { setFlow(genFlow()) }}>change</button>
          </Toolbar>
        </FlowProvider>
      </CanvasStyleProvider>

      <textarea readOnly style={{ width: '20%', marginTop: 48, marginLeft: 10 }} value={
        ''
      } />
    </div >
  );
}

export default App;
