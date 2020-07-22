import { useEffect } from 'react';

export function useEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any): void;
export function useEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, element: HTMLElement): void;

export function useEventListener(type: string, listener: (this: Window | HTMLElement, ev: Event) => any, el?: Window | HTMLElement) {
    const element = el || window;

    useEffect(() => {
        if (listener) element.addEventListener(type, listener);

        return () => {
            if (listener) element.removeEventListener(type, listener);
        };
    }, [type, element, listener]);
}