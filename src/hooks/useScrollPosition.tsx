import { useState, useLayoutEffect } from 'react';

const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState<number>(Math.max(0, window.scrollY));

  useLayoutEffect(() => {
    const onScroll = () => setScrollPosition(Math.max(0, window.scrollY));
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll); // clean up
  }, []);

  return scrollPosition;
};

export default useScrollPosition;
