import { useState, useCallback } from 'react';

export interface Position {
    x: number,
    y: number,
}

export interface Offset {
    x: number,
    y: number,
}

export interface Rect {
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
}

export function useMoving(callback: (offset: Offset) => void): [(initPos: Position, limit?: Rect) => void, () => void, (e: React.MouseEvent) => void] {
    const [initPos, setInitPos] = useState<Position>();
    const [lastPos, setLastPos] = useState<Position>();
    const [limit, setLimit] = useState<Rect>();

    const startMoving = useCallback((initPos: Position, limit?: Rect) => {
        setInitPos(initPos);
        setLastPos(initPos);
        setLimit(limit);
    }, [setInitPos, setLastPos, setLimit]);

    const cancelMoving = useCallback(() => {
        setLastPos(undefined);
    }, [setLastPos]);

    const onMoving = useCallback((e: React.MouseEvent) => {
        if (initPos && lastPos) {
            const offset = {
                x: e.pageX - lastPos.x,
                y: e.pageY - lastPos.y,
            };

            const newPos = {
                x: lastPos.x + offset.x,
                y: lastPos.y + offset.y,
            };

            if (limit) {
                if (limit.x1 !== undefined && newPos.x < limit.x1) {
                    const delta = limit.x1 - newPos.x;
                    offset.x += delta;
                    newPos.x += delta;
                }

                if (limit.y1 !== undefined && newPos.y < limit.y1) {
                    const delta = limit.y1 - newPos.y;
                    offset.y += delta;
                    newPos.y += delta;
                }

                if (limit.x2 !== undefined && newPos.x > limit.x2) {
                    const delta = newPos.x - limit.x2;
                    offset.x -= delta;
                    newPos.x -= delta;
                }

                if (limit.y2 !== undefined && newPos.y > limit.y2) {
                    const delta = newPos.y - limit.y2;
                    offset.y -= delta;
                    newPos.y -= delta;
                }
            }

            callback(offset);
            setLastPos(newPos);
        }
    }, [initPos, lastPos, limit, setLastPos, callback]);

    return [startMoving, cancelMoving, onMoving];
}