import { useMoving } from 'hooks/useMoving';
import { useFlowDispatchContext, useFlowContext } from 'contexts/FlowContext';
import { useCallback, useState } from 'react';
import { IOffset } from 'models/BasicTypes';
import { useEventListener } from 'hooks/useEventListener';

export const useTranslatableCanvas = () => {
  const { viewBound } = useFlowContext();
  const dispatch = useFlowDispatchContext();
  const [initViewBound, setInitViewBound] = useState<IOffset>();

  const [_startTranslate, stopTranslate, onTranslate] = useMoving(
    useCallback(
      offset => {
        if (initViewBound)
          dispatch({
            type: 'setViewOffset',
            offset: {
              x: initViewBound.x - offset.x,
              y: initViewBound.y - offset.y,
            },
          });
      },
      [dispatch, initViewBound]
    )
  );

  const startTranslate = useCallback(
    e => {
      _startTranslate(e);
      setInitViewBound(viewBound);
    },
    [_startTranslate, viewBound]
  );

  useEventListener('mouseup', e => stopTranslate(false));

  return { startTranslate, stopTranslate, onTranslate };
};
