import { useMoving } from 'hooks/useMoving';
import { useFlowDispatchContext, useFlowContext } from 'contexts/FlowContext';
import { useCallback, useState } from 'react';
import { IOffset } from 'models/BasicTypes';
import { useEventListener } from 'hooks/useEventListener';

export const useTranslatableCanvas = () => {
  const { viewBound, scale } = useFlowContext();
  const dispatch = useFlowDispatchContext();
  const [initViewBound, setInitViewBound] = useState<IOffset>();

  const [_startTranslate, stopTranslate, onTranslate] = useMoving(
    useCallback(
      offset => {
        if (initViewBound)
          dispatch({
            type: 'setViewOffset',
            offset: {
              x: initViewBound.x - offset.x / scale,
              y: initViewBound.y - offset.y / scale,
            },
          });
      },
      [dispatch, scale, initViewBound]
    )
  );

  const startTranslate = useCallback(
    e => {
      _startTranslate(e);
      setInitViewBound(viewBound.toJS());
    },
    [_startTranslate, viewBound]
  );

  useEventListener('mouseup', e => stopTranslate(false));

  useEventListener(
    'keydown',
    useCallback(
      e => {
        // Escape will cancel the current moving or resizing and restore the previous layout
        if (e.key === 'Escape' && initViewBound) {
          stopTranslate(true);
          dispatch({
            type: 'setViewOffset',
            offset: initViewBound,
          });
        }
      },
      [stopTranslate, initViewBound, dispatch]
    )
  );

  return { startTranslate, stopTranslate, onTranslate };
};
