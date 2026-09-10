import { useState, useLayoutEffect } from 'react';
import { useViewportTracker } from 'hooks/useViewportTracker';

export const useElementRect = (ref: React.RefObject<HTMLElement | null>, enabled = true) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const viewport = useViewportTracker(enabled);

  // Re-read position whenever it's (re)enabled or the viewport scrolls or resizes (does not need to
  // touch the observer). Re-enabling matters because the ref may not have been attached on first mount.
  useLayoutEffect(() => {
    if (!enabled || !ref.current) return;
    setRect(ref.current.getBoundingClientRect());
  }, [ref, viewport, enabled]);

  // Stable observer that tracks element size changes independently
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
