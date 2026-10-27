import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { afterTransitions } from '@/utilities/animation';

// Keeps an element mounted once `shown` turns false until the transitions that hide it finish, then unmounts it and calls `onGone`.
export const usePresence = <E extends Element>(shown: boolean, onGone?: () => void) => {
  const ref = useRef<E>(null);
  const [present, setPresent] = useState(shown);
  const gone = useEffectEvent(() => onGone?.());

  if (shown && !present) setPresent(true);

  useEffect(() => {
    if (shown || !present) return;
    const element = ref.current;
    let current = true;
    const leave = async () => {
      if (element) await afterTransitions(element);
      if (!current) return;
      setPresent(false);
      gone();
    };
    void leave();
    return () => {
      current = false;
    };
  }, [shown, present]);

  return { ref, present };
};
