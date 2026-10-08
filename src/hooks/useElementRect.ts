import { type RefObject, useLayoutEffect, useState } from 'react';

import { useViewportTracker } from '@/hooks/useViewportTracker';

export const useElementRect = (ref?: RefObject<HTMLElement | null>, enabled = true) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const viewport = useViewportTracker(enabled);

  useLayoutEffect(() => {
    if (!enabled || !ref?.current) return;
    setRect(ref.current.getBoundingClientRect());
  }, [ref, viewport, enabled]);

  useLayoutEffect(() => {
    if (!enabled || !ref?.current) return;
    const element = ref.current;
    const observer = new ResizeObserver(() => setRect(element.getBoundingClientRect()));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, enabled]);

  return rect;
};
