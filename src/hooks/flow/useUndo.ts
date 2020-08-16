import { useFlowDispatchContext } from 'contexts/FlowContext';
import { useEventListener } from 'hooks/useEventListener';

export const useUndo = () => {
  const dispatch = useFlowDispatchContext();

  useEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'z') dispatch({ type: 'undo' });

    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.key === 'Z')) dispatch({ type: 'redo' });
  });
};
