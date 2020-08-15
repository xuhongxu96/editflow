import { useState, useEffect, RefObject, DependencyList } from 'react';
import { Rect, makeRect } from 'models/BasicTypes';

export function useClientRect<T extends Element>(
  ref: RefObject<T>,
  deps: DependencyList = []
): Rect {
  const [sizeChanged, _setSizeChanged] = useState<number>(0);
  const [realRect, setRealRect] = useState<Rect>(makeRect({ x: 0, y: 0, w: 0, h: 0 }));

  useEffect(() => {
    if (ref.current != null)
      setRealRect(
        makeRect({
          x: ref.current.getBoundingClientRect().x,
          y: ref.current.getBoundingClientRect().y,
          w: ref.current.getBoundingClientRect().width,
          h: ref.current.getBoundingClientRect().height,
        })
      );
  }, [ref, sizeChanged, /* eslint-disable */ ...deps /* eslint-enable */]);

  useEffect(() => {
    const listener = () => {
      _setSizeChanged(i => i + 1);
    };
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, []);

  return realRect;
}
