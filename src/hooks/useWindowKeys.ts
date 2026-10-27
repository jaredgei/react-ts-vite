import { useEffect, useEffectEvent } from 'react';

// A key belongs to whatever already handled it, to an open dialog or menu, or, unless it is Escape, to the field being typed in.
const isTaken = (event: KeyboardEvent) => {
  if (event.defaultPrevented || document.querySelector('dialog[open]')) return true;
  if (!(event.target instanceof Element)) return false;
  if (event.target.closest('dialog, [popover]')) return true;
  return event.key !== 'Escape' && Boolean(event.target.closest('input, textarea, select, [contenteditable]'));
};

export const useWindowKeys = (type: 'keydown' | 'keyup', onKey: (event: KeyboardEvent) => void, capture = false) => {
  const handle = useEffectEvent(onKey);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (!isTaken(event)) handle(event);
    };
    window.addEventListener(type, listener, capture);
    return () => window.removeEventListener(type, listener, capture);
  }, [type, capture]);
};
