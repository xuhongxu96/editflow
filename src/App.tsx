import React, { useState, useMemo } from 'react';
import { Canvas } from 'components/Canvas';
import { Flow, NodeMap, EdgeMap, Node } from 'models/Flow';
import { FlowProvider } from 'contexts/FlowContext';
import { Toolbar } from 'components/Toolbar';
import { CanvasStyleProvider } from 'contexts/CanvasStyleContext';
import { useFlowState } from 'hooks/flow';
import { NodeToolbox } from 'components/NodeToolbox';

const W = 120;
const H = 40;
const Space = 10;
const RowSize = 5;
const OffsetX = 0;
const OffsetY = 48;
const NodeCount = 10;
const EdgeCount = 1;

const generatePorts = (namePrefix: string, n: number) => {
  return Array.from(Array(n).keys()).map((_, i) => ({
    name: `${namePrefix} ${i}`,
    type: ['str', 'int', 'bool'][Math.trunc(Math.random() * 3)],
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
  const [flow, setFlow] = useState(() => genFlow());
  const [flowState, dispatch] = useFlowState(flow);

  return (
    <div className='App' style={{ display: 'flex' }}>
      <FlowProvider flowState={flowState} dispatch={dispatch}>
        <NodeToolbox nodeTemplates={[
          {
            title: '拆分数据', input: [], output: []
          },
          {
            title: '数据文件', input: [], output: []
          }
        ]} />

        <CanvasStyleProvider>
          <Canvas width='80%' height='600' />
          <Toolbar>
            <button onClick={() => { setFlow(genFlow()) }}>change</button>
          </Toolbar>
        </CanvasStyleProvider>
      </FlowProvider>

      <textarea readOnly style={{ width: '20%', marginTop: 48, marginLeft: 10 }} value={
        'Selected Nodes:\n' +
        useMemo(() =>
          JSON.stringify(Array.from(flowState.selectedNodeIds)
            .map(id => [flowState.raw.nodes[id], id] as [Node, string])
            .map(([o, id]) => ({ id: id, title: o.title, layout: o.layout })), null, ' '),
          [flowState.selectedNodeIds, flowState.raw.nodes])
        + '\nSelected Edges:\n' +
        useMemo(() =>
          JSON.stringify(Array.from(flowState.selectedEdgeIds)
            .map(id => ({ id: id, ...flowState.raw.edges[id] })), null, ' '),
          [flowState.selectedEdgeIds, flowState.raw.edges])
      } />
    </div >
  );
}

export default App;
