import { useState, useCallback } from 'react';
import { Offset, Point } from 'models/BasicTypes';

export interface LimitRect {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
}

export type MovingCallback = (offset: Offset) => void;
export type StartMovingFunction = (e: React.MouseEvent, limit?: LimitRect) => void;
export type StopMovingFunction = (cancel: boolean) => void;
export type MovingEventListener = (e: React.MouseEvent) => boolean;

export function useMoving(callback: MovingCallback): [StartMovingFunction, StopMovingFunction, MovingEventListener] {
    const [initPos, setInitPos] = useState<Point>();
    const [limit, setLimit] = useState<LimitRect>();

    const startMoving = useCallback<StartMovingFunction>((e: React.MouseEvent, limit?: LimitRect) => {
        const initPos = { x: e.pageX, y: e.pageY };
        setInitPos(initPos);
        setLimit(limit);
    }, []);

    const stopMoving = useCallback<StopMovingFunction>(cancel => {
        if (cancel)
            callback({ x: 0, y: 0 });
        setInitPos(undefined);
    }, [callback]);

    const onMoving = useCallback((e: React.MouseEvent) => {
        if (initPos) {
            let offset = { x: e.pageX - initPos.x, y: e.pageY - initPos.y };

            if (limit) {
                if (limit.left !== undefined && offset.x < limit.left) offset.x = limit.left;
                if (limit.top !== undefined && offset.y < limit.top) offset.y = limit.top;
                if (limit.right !== undefined && offset.x > limit.right) offset.x = limit.right;
                if (limit.bottom !== undefined && offset.y > limit.bottom) offset.y = limit.bottom;
            }

            callback(offset);
            return true;
        }
        return false;
    }, [initPos, limit, callback]);

    return [startMoving, stopMoving, onMoving];
}