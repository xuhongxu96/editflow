import { useFlowContext, useFlowDispatchContext } from 'contexts/FlowContext';
import { useCallback, useState } from 'react';
import { EdgeState, makeEdgeState } from 'models/FlowState';
import { useMoving } from 'hooks/useMoving';
import { useEventListener } from 'hooks';
import { OnNodePortMouseEventListener } from 'components/Node';
import { getPortPosition } from 'utils';
import { Rect } from 'models/BasicTypes';

export const useEditableEdge = (clientRect: Rect) => {
  const { raw, selectedPort, targetPort, viewBound, scale } = useFlowContext();
  const dispatch = useFlowDispatchContext();

  const [draftEdge, setDraftEdge] = useState<{ edge: EdgeState; connected: boolean }>();

  const [startMoving, stopMoving, onCanvasMouseMove] = useMoving(
    useCallback(
      (offset, e) => {
        if (selectedPort && e) {
          setDraftEdge({
            edge: makeEdgeState({
              start: getPortPosition(
                raw.nodes[selectedPort.nodeId],
                selectedPort.io,
                selectedPort.index
              ),
              end: targetPort
                ? getPortPosition(raw.nodes[targetPort.nodeId], targetPort.io, targetPort.index)
                : {
                    x: (e.pageX - clientRect.x) / scale + viewBound.x,
                    y: (e.pageY - clientRect.y) / scale + viewBound.y,
                  },
            }),
            connected: targetPort !== undefined,
          });
        }
      },
      [raw.nodes, selectedPort, targetPort, viewBound, scale, clientRect]
    )
  );

  useEventListener(
    'mouseup',
    useCallback(() => {
      if (selectedPort) {
        stopMoving(false);
        setDraftEdge(undefined);
        dispatch({ type: 'unselectPort' });
        dispatch({ type: 'unsetTargetPort' });
      }
    }, [stopMoving, dispatch, selectedPort])
  );

  const onPortMouseDown = useCallback<OnNodePortMouseEventListener>(
    (e, nodeId, _, io, index) => {
      if (io === 'output') {
        dispatch({ type: 'setSelectPort', nodeId, io, index });
        startMoving(e);
      }
    },
    [startMoving, dispatch]
  );

  const onPortMouseUp = useCallback<OnNodePortMouseEventListener>(
    (e, nodeId, _, io, index) => {
      if (selectedPort && targetPort) {
        dispatch({ type: 'addEdge', startPort: selectedPort, endPort: targetPort });
      }
    },
    [selectedPort, targetPort, dispatch]
  );

  const onPortMouseEnter = useCallback<OnNodePortMouseEventListener>(
    (e, nodeId, _, io, index) => {
      if (io === 'input') {
        dispatch({ type: 'setTargetPort', nodeId, io, index });
      }
    },
    [dispatch]
  );

  const onPortMouseLeave = useCallback<OnNodePortMouseEventListener>(
    (e, nodeId, _, io, index) => {
      dispatch({ type: 'unsetTargetPort' });
    },
    [dispatch]
  );

  return {
    onCanvasMouseMove,
    onPortMouseDown,
    onPortMouseUp,
    onPortMouseEnter,
    onPortMouseLeave,
    draftEdge,
  };
};
