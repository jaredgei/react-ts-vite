import { useSyncExternalStore } from 'react';

const subscribe = (callback: () => void) => {
  window.addEventListener('scroll', callback, { passive: true });
  return () => window.removeEventListener('scroll', callback);
};

const getSnapshot = () => Math.max(0, window.scrollY);
const getServerSnapshot = () => 0;

const useScrollPosition = () => {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

export default useScrollPosition;
