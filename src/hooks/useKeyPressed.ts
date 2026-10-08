import { useEffect, useEffectEvent } from 'react';

export const useKeyPressed = (targetKey: string, onKeyDown: (event: KeyboardEvent) => void) => {
  const handler = useEffectEvent(onKeyDown);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === targetKey) handler(event);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [targetKey]);
};
