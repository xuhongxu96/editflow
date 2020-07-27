import { useFlowDispatchContext, useFlowContext } from "contexts/FlowContext";
import { useEventListener } from "hooks";
import { useCallback, useEffect } from "react";

export const useSelectableEdge = () => {
    const { selectedEdgeIds, raw, clientRect } = useFlowContext();
    const dispatch = useFlowDispatchContext();

    useEventListener(
        "mousedown",
        useCallback(
          (e) => {
            if (
              e.pageX >= clientRect.x &&
              e.pageX <= clientRect.x + clientRect.w &&
              e.pageY >= clientRect.y &&
              e.pageY <= clientRect.h - clientRect.y
            ) {
              dispatch({ type: "unselectAllEdges" });
            }
          },
          [dispatch, clientRect]
        )
      );

    useEffect(() => {
        if (selectedEdgeIds.size > 0) dispatch({ type: 'unselectAllNodes' });

        dispatch({
            type: 'setHighlightedNodes',
            ids: Array.from(Array.from(selectedEdgeIds.keys())
                .reduce((p, id) => {
                    p.add(raw.edges[id].start.nodeId);
                    p.add(raw.edges[id].end.nodeId);
                    return p;
                }, new Set<string>()).keys())
        });
    }, [raw.edges, selectedEdgeIds, dispatch]);

    const onEdgeMouseDown = useCallback((e, edgeId) => {
        dispatch({ type: 'setSelectEdges', ids: [edgeId] });
        e.stopPropagation();
    }, [dispatch]);

    return { onEdgeMouseDown };
};