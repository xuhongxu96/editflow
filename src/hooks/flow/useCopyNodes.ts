import { useFlowDispatchContext, useFlowContext } from 'contexts/FlowContext';
import { useEventListener } from 'hooks/useEventListener';
import { copyText, pasteText } from 'utils';

export const useCopyShortcut = () => {
  const { selectedNodeIds } = useFlowContext();
  const dispatch = useFlowDispatchContext();

  useEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'c')
      dispatch({
        type: 'copyNodes',
        onCopy: info => copyText(JSON.stringify(info)),
        ids: Array.from(selectedNodeIds),
      });

    if (e.ctrlKey && e.key === 'x') {
      dispatch({
        type: 'copyNodes',
        onCopy: info => copyText(JSON.stringify(info)),
        ids: Array.from(selectedNodeIds),
      });
      dispatch({ type: 'deleteNodes', ids: Array.from(selectedNodeIds) });
    }

    if (e.ctrlKey && e.key === 'v')
      pasteText().then(clipText => {
        try {
          const info = JSON.parse(clipText);
          dispatch({ type: 'pasteNodes', info: info });
        } catch {
          console.error('Invalid copy info');
        }
      });
  });
};
