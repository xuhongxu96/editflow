import {
  useFlowStackContext,
  useFlowDispatchContext,
  useFlowStackDispatchContext,
} from 'contexts/FlowContext';
import { useCallback, useState } from 'react';
import _ from 'lodash';
import { EdgeState } from 'models/FlowState';
import { useMoving } from 'hooks/useMoving';
import { useEventListener } from 'hooks';
import { OnNodePortMouseEventListener } from 'components/Node';
import { getPortPosition } from 'utils';
import { Rect } from 'models/BasicTypes';

export const useEditableEdge = (clientRect: Rect) => {
  const { present } = useFlowStackContext();
  const { raw, selectedPort, targetPort, viewBound, scale } = present;
  const dispatch = useFlowDispatchContext();
  const flowStackDispatch = useFlowStackDispatchContext();

  const [draftEdge, setDraftEdge] = useState<{ edge: EdgeState; connected: boolean }>();

  const [startMoving, stopMoving, onCanvasMouseMove] = useMoving(
    useCallback(
      (offset, e) => {
        if (selectedPort && e) {
          setDraftEdge({
            edge: {
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
            },
            connected: targetPort !== undefined,
          });
        }
      },
      [raw.nodes, selectedPort, targetPort, viewBound, scale, clientRect]
    )
  );

  useEventListener(
    'mouseup',
    useCallback(
      e => {
        if (
          e.pageX >= clientRect.x &&
          e.pageX <= clientRect.x + clientRect.w &&
          e.pageY >= clientRect.y &&
          e.pageY <= clientRect.h - clientRect.y
        ) {
          if (selectedPort) {
            stopMoving(false);
            setDraftEdge(undefined);
            dispatch({ type: 'unselectPort' });
            dispatch({ type: 'unsetTargetPort' });
          }
        }
      },
      [stopMoving, dispatch, selectedPort, clientRect]
    )
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
    (e, nodeId, port, io, index) => {
      if (selectedPort && targetPort) {
        dispatch({ type: 'addEdge', startPort: selectedPort, endPort: targetPort });
        flowStackDispatch({
          type: 'set',
          newflowState: present,
          quadTree: _.cloneDeep(present.nodeIdQuadTree),
        });
      }
    },
    [selectedPort, targetPort, dispatch, present, flowStackDispatch]
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
