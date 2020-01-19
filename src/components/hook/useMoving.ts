import { useState, useCallback } from 'react';

export interface Position {
    x: number,
    y: number,
}

export interface Offset {
    x: number,
    y: number,
}

export function useMoving(callback: (offset: Offset) => void): [(initPos: Position) => void, () => void, (e: React.MouseEvent) => void] {
    const [lastPos, setLastPos] = useState<Position>();

    const startMoving = useCallback((initPos: Position) => {
        setLastPos(initPos);
    }, [setLastPos]);

    const cancelMoving = useCallback(() => {
        setLastPos(undefined);
    }, [setLastPos]);

    const onMoving = useCallback((e: React.MouseEvent) => {
        if (lastPos) {
            callback({
                x: e.clientX - lastPos.x,
                y: e.clientY - lastPos.y,
            });
            setLastPos({
                x: e.clientX,
                y: e.clientY,
            });
        }
    }, [lastPos, setLastPos, callback]);

    return [startMoving, cancelMoving, onMoving];
}