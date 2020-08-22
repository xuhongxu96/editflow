import { useMoving } from 'hooks/useMoving';
import { useCallback, useState } from 'react';
import { IRect } from 'models/BasicTypes';
import { useFlowContext, useFlowDispatchContext } from 'contexts/FlowContext';
import { useEventListener } from 'hooks';
import { isIntersected } from 'utils';

export const useBoxSelection = () => {
  const { scale, nodeIdQuadTree, clientRect, viewBound, raw } = useFlowContext();
  const dispatch = useFlowDispatchContext();
  const [selection, setSelection] = useState<IRect>();

  const [startSelection, _stopSelection, onSelection] = useMoving(
    useCallback(
      (offset, initPos) => {
        initPos.x += -clientRect.x;
        initPos.y += -clientRect.y;
        const rect = {
          x: (offset.x < 0 ? initPos.x + offset.x : initPos.x) / scale + viewBound.x,
          y: (offset.y < 0 ? initPos.y + offset.y : initPos.y) / scale + viewBound.y,
          w: Math.abs(offset.x) / scale,
          h: Math.abs(offset.y) / scale,
        };
        setSelection(rect);
        const nodeIds = nodeIdQuadTree
          .getCoveredData(rect)
          .filter(id => isIntersected(rect, raw.nodes[id].layout));
        dispatch({ type: 'setSelectNodes', ids: nodeIds });
      },
      [clientRect, scale, nodeIdQuadTree, viewBound, dispatch, raw]
    )
  );

  const stopSelection = useCallback(() => {
    setSelection(undefined);
    _stopSelection(false);
  }, [_stopSelection]);

  useEventListener(
    'mouseup',
    useCallback(e => stopSelection(), [stopSelection])
  );

  return { startSelection, stopSelection, onSelection, selection };
};
