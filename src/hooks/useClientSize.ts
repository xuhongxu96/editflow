import { useState, useCallback, useEffect, useRef } from "react";
import { Size } from "models/BasicTypes";

export function useClientSize(): [Size, (el: Element | null) => void, () => void] {
    const [sizeChanged, _setSizeChanged] = useState<number>(0);
    const setSizeChanged = useCallback(() => _setSizeChanged(i => i + 1), []);

    const [realSize, setRealSize] = useState<Size>({ w: 0, h: 0 });
    const ref = useRef<Element>();

    const refCallback = useCallback((el: Element | null) => {
        if (el != null) {
            ref.current = el;
        }
    }, []);

    useEffect(() => {
        if (ref.current != null
            && (realSize.w !== ref.current.clientWidth || realSize.h !== ref.current.clientHeight))
            setRealSize({ w: ref.current.clientWidth, h: ref.current.clientHeight });
    }, [sizeChanged, realSize.w, realSize.h]);

    useEffect(() => {
        const listener = () => {
            setSizeChanged();
        };
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [setSizeChanged]);

    return [realSize, refCallback, setSizeChanged];
}