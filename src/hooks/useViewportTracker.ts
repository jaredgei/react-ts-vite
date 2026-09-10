import { useSyncExternalStore } from 'react';

type Viewport = {
  scrollY: number;
  width: number;
  height: number;
};

let viewport: Viewport = { scrollY: 0, width: 0, height: 0 };
const listeners = new Set<() => void>();

const update = () => {
  viewport = {
    scrollY: Math.max(0, window.scrollY),
    width: window.innerWidth,
    height: window.innerHeight,
  };
  listeners.forEach((listener) => listener());
};

if (typeof window !== 'undefined') {
  update();
  window.addEventListener('resize', update, { passive: true });
  window.addEventListener('scroll', update, { capture: true, passive: true });
}

const subscribe = (callback: () => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const noopSubscribe = () => () => {};
const serverSnapshot: Viewport = { scrollY: 0, width: 0, height: 0 };

export const useViewportTracker = (enabled = true) => {
  return useSyncExternalStore(
    enabled ? subscribe : noopSubscribe,
    () => viewport,
    () => serverSnapshot,
  );
};
