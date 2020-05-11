import { useFlowDispatchContext, useFlowContext } from "contexts/FlowContext";
import { useCallback } from "react";
import { useEventListener } from "hooks";

export const useSelectableNode = () => {
    const { selectedNodeIds } = useFlowContext();
    const dispatch = useFlowDispatchContext();

    const onNodeMouseDown = useCallback((e: React.MouseEvent, id: string) => {
        if (!selectedNodeIds.has(id)) {
            if (e.ctrlKey) {
                dispatch({ type: 'addSelectNodes', ids: [id] });
            } else {
                dispatch({ type: 'setSelectNodes', ids: [id] });
            }
        }
        e.stopPropagation();
    }, [selectedNodeIds, dispatch]);

    const onNodeClick = useCallback((e: React.MouseEvent, id: string) => {
        // No need to check if it is selected here, because when node is selected,
        // it will be moved from visibleNodes to selectedNodes, and the click event won't be triggered.
        if (e.ctrlKey) {
            dispatch({ type: 'unselectNodes', ids: [id] });
        }
    }, [dispatch]);

    useEventListener('mousedown', () => {
        dispatch({ type: 'unselectAllNodes' });
    });

    return { onNodeMouseDown, onNodeClick };
};