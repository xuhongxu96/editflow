import { useState, useEffect, RefObject, DependencyList } from "react";
import { Size } from "models/BasicTypes";

export function useClientSize<T extends Element>(ref: RefObject<T>, deps: DependencyList = []): Size {
    const [sizeChanged, _setSizeChanged] = useState<number>(0);
    const [realSize, setRealSize] = useState<Size>({ w: 0, h: 0 });

    useEffect(() => {
        if (ref.current != null) setRealSize({ w: ref.current.clientWidth, h: ref.current.clientHeight });
    }, [ref, sizeChanged, /* eslint-disable */...deps/* eslint-enable */]);

    useEffect(() => {
        const listener = () => { _setSizeChanged(i => i + 1); };
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, []);

    return realSize;
}