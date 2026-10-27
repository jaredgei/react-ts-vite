import { useSyncExternalStore } from 'react';

type Viewport = {
  scrollY: number;
  width: number;
  height: number;
};

let viewport: Viewport = { scrollY: window.scrollY, width: window.innerWidth, height: window.innerHeight };
// Counts every scroll and resize, including scrolling inside an element, which moves whatever is anchored there.
let moves = 0;
const listeners = new Set<() => void>();
let frame = 0;

const flush = () => {
  frame = 0;
  moves += 1;
  const next = { scrollY: Math.max(0, window.scrollY), width: window.innerWidth, height: window.innerHeight };
  if (next.scrollY !== viewport.scrollY || next.width !== viewport.width || next.height !== viewport.height) viewport = next;
  listeners.forEach((listener) => listener());
};

const onChange = () => {
  if (!frame) frame = requestAnimationFrame(flush);
};

const subscribe = (callback: () => void) => {
  if (!listeners.size) {
    window.addEventListener('resize', onChange, { passive: true });
    window.addEventListener('scroll', onChange, { capture: true, passive: true });
  }
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
    if (!listeners.size) {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, { capture: true });
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }
  };
};

const noopSubscribe = () => () => {};

export const useViewportTracker = () => useSyncExternalStore(subscribe, () => viewport);

export const useViewportMoves = (enabled = true) => useSyncExternalStore(enabled ? subscribe : noopSubscribe, () => moves);
