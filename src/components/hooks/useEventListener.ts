import { useRef, useEffect } from 'react';

export function useEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any): void;
export function useEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, element: HTMLElement): void;

export function useEventListener(type: string, listener: (this: Window | HTMLElement, ev: Event) => any, el?: Window | HTMLElement) {
    const savedListener = useRef<any>();
    useEffect(() => {
        savedListener.current = listener;
    }, [listener]);

    const element = el || window;

    useEffect(() => {
        if (savedListener.current)
            element.addEventListener(type, savedListener.current);

        return () => {
            if (savedListener.current)
                element.removeEventListener(type, savedListener.current);
        };
    }, [type, element]);
}