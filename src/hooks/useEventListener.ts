import { useEffect } from 'react';

export function useEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any
): void;

export function useEventListener(type: string, listener: (this: any, ev: any) => any) {
  useEffect(() => {
    window.addEventListener(type, listener);

    return () => {
      window.removeEventListener(type, listener);
    };
  }, [type, listener]);
}
