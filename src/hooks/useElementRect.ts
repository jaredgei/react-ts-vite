import { useState, useLayoutEffect } from 'react';

import { useViewportTracker } from 'hooks/useViewportTracker';

export const useElementRect = (ref: React.RefObject<HTMLElement | null>, enabled = true) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const viewport = useViewportTracker(enabled);

  useLayoutEffect(() => {
    if (!enabled || !ref.current) return;
    setRect(ref.current.getBoundingClientRect());
  }, [ref, viewport, enabled]);

  useLayoutEffect(() => {
    if (!enabled || !ref.current) return;
    const observer = new ResizeObserver(() => {
      if (ref.current) setRect(ref.current.getBoundingClientRect());
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, enabled]);

  return rect;
};
