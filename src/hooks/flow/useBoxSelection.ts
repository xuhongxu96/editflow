import { useMoving } from 'hooks/useMoving';
import { useCallback, useState } from 'react';
import { IRect } from 'models/BasicTypes';
import { useFlowContext, useFlowDispatchContext } from 'contexts/FlowContext';
import { useEventListener } from 'hooks';
import { isIntersected } from 'utils';

export const useBoxSelection = () => {
  const { nodeIdQuadTree, clientRect, viewBound, raw } = useFlowContext();
  const dispatch = useFlowDispatchContext();
  const [selection, setSelection] = useState<IRect>();

  const [startSelection, _stopSelection, onSelection] = useMoving(
    useCallback(
      (offset, initPos) => {
        initPos.x += -clientRect.x + viewBound.x;
        initPos.y += -clientRect.y + viewBound.y;
        const rect = {
          x: offset.x < 0 ? initPos.x + offset.x : initPos.x,
          y: offset.y < 0 ? initPos.y + offset.y : initPos.y,
          w: Math.abs(offset.x),
          h: Math.abs(offset.y),
        };
        setSelection(rect);
        const nodeIds = nodeIdQuadTree
          .getCoveredData(rect)
          .filter(id => isIntersected(rect, raw.nodes[id].layout));
        dispatch({ type: 'setSelectNodes', ids: nodeIds });
      },
      [clientRect, nodeIdQuadTree, viewBound, dispatch, raw]
    )
  );

  const stopSelection = useCallback(() => {
    setSelection(undefined);
    _stopSelection(false);
  }, [_stopSelection]);

  useEventListener('mouseup', e => stopSelection());

  return { startSelection, stopSelection, onSelection, selection };
};
