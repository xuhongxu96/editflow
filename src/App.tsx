import React, { useState, useMemo } from 'react';
import { Canvas } from 'components/Canvas';
import { Flow, NodeMap, Node } from 'models/Flow';
import { FlowProvider } from 'contexts/FlowContext';
import { Toolbar } from 'components/Toolbar';
import { CanvasStyleProvider } from 'contexts/CanvasStyleContext';
import { useFlowState } from 'hooks/flow';
import { NodeToolbox } from 'components/NodeToolbox';
import { makeRect } from 'models/BasicTypes';

const W = 120;
const H = 40;
const Space = 10;
const RowSize = 5;
const OffsetX = 0;
const OffsetY = 0;
const NodeCount = 100;

const generatePorts = (namePrefix: string, n: number) => {
  return Array.from(Array(n).keys()).map((_, i) => ({
    name: `${namePrefix} ${i}`,
    type: ['str', 'int', 'bool'][Math.trunc(Math.random() * 3)],
  }));
};

const genFlow = (): Flow => {
  return {
    nodes: Array.from(Array(NodeCount).keys()).reduce((o, i) => {
      o[`node-${i}`] = {
        layout: makeRect({
          x: OffsetX + Space + (W + Space) * (i % RowSize),
          y: OffsetY + Space + (H + Space) * Math.trunc(i / RowSize),
          w: W,
          h: H,
        }),
        title: `Component ${i}`,
        input: generatePorts('In', Math.trunc(Math.random() * 8) + 2),
        output: generatePorts('Out', Math.trunc(Math.random() * 8) + 2),
      };
      return o;
    }, {} as NodeMap),
    edges: {},
  };
};

const App: React.FC = () => {
  const [flow, setFlow] = useState(() => genFlow());
  const [flowState, dispatch] = useFlowState(flow);

  return (
    <div className="App" style={{ display: 'flex' }}>
      <FlowProvider flowState={flowState} dispatch={dispatch}>
        <NodeToolbox
          nodeTemplates={[
            {
              title: '数据文件',
              input: [],
              output: [{ type: 'str', name: 'o1' }],
            },
            {
              title: '拆分数据',
              input: [{ type: 'str', name: 'input' }],
              output: [
                { type: 'str', name: 'o1' },
                { type: 'str', name: 'o2' },
              ],
            },
          ]}
        />

        <CanvasStyleProvider>
          <Canvas width="80%" height="600" />
        </CanvasStyleProvider>

        <Toolbar>
          <button
            onClick={() => {
              setFlow(genFlow());
            }}
          >
            Re-generate Flow
          </button>
        </Toolbar>
      </FlowProvider>

      <textarea
        readOnly
        style={{ width: '20%', marginLeft: 10 }}
        value={
          'Selected Nodes:\n' +
          useMemo(
            () =>
              JSON.stringify(
                Array.from(flowState.selectedNodeIds)
                  .map(id => [flowState.raw.nodes[id], id] as [Node, string])
                  .map(([o, id]) => ({ id: id, title: o.title, layout: o.layout })),
                null,
                ' '
              ),
            [flowState.selectedNodeIds, flowState.raw.nodes]
          ) +
          '\nSelected Edges:\n' +
          useMemo(
            () =>
              JSON.stringify(
                Array.from(flowState.selectedEdgeIds).map(id => ({
                  id: id,
                  ...flowState.raw.edges[id],
                })),
                null,
                ' '
              ),
            [flowState.selectedEdgeIds, flowState.raw.edges]
          ) +
          '\n\nUndo:\n' +
          useMemo(() => JSON.stringify(flowState.undoStack.toJS(), null, ' '), [
            flowState.undoStack,
          ]) +
          '\n\nRedo:\n' +
          useMemo(() => JSON.stringify(flowState.redoStack.toJS(), null, ' '), [
            flowState.redoStack,
          ])
        }
      />
    </div>
  );
};

export default App;
