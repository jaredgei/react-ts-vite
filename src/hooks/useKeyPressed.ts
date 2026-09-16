import { useEffect } from 'react';

type Handler = (event: KeyboardEvent) => void;
const listeners = new Set<Handler>();

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (event) => {
    listeners.forEach((listener) => listener(event));
  });
}

export const useKeyPressed = (targetKey: string, onKeyDown: (event: KeyboardEvent) => void) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === targetKey) onKeyDown(event);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, [targetKey, onKeyDown]);
};
