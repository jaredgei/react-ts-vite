import { useSyncExternalStore } from 'react';

let scrollResizeVersion = 0;
const listeners = new Set<() => void>();

const notify = () => {
  scrollResizeVersion++;
  listeners.forEach((cb) => cb());
};

if (typeof window !== 'undefined') {
  window.addEventListener('resize', notify, { passive: true });
  window.addEventListener('scroll', notify, { capture: true, passive: true });
}

const subscribe = (callback: () => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const noopSubscribe = () => () => {};

export const useViewportTracker = (enabled = true) => {
  return useSyncExternalStore(
    enabled ? subscribe : noopSubscribe,
    () => scrollResizeVersion,
    () => 0,
  );
};
