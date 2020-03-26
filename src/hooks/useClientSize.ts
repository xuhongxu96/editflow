import { useState, useCallback } from "react";
import { Size } from "models/BasicTypes";

export function useClientSize(): [Size, (el: Element | null) => void] {
    const [realSize, setRealSize] = useState<Size>({ w: 0, h: 0 });
    const refCallback = useCallback((el: Element | null) => {
        if (el != null) {
            setRealSize({ w: el.clientWidth, h: el.clientHeight });
        }
    }, []);

    return [realSize, refCallback];
}