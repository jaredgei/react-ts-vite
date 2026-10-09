import type { Path } from 'react-router';

const isLocalPath = (value: unknown): value is Pick<Path, 'pathname'> & Partial<Path> =>
  typeof value === 'object' &&
  value !== null &&
  'pathname' in value &&
  typeof value.pathname === 'string' &&
  value.pathname.startsWith('/') &&
  new URL(value.pathname, window.location.origin).origin === window.location.origin;

export const redirectTarget = (state: unknown): Partial<Path> => {
  const from: unknown = typeof state === 'object' && state !== null && 'from' in state ? state.from : null;
  if (!isLocalPath(from)) return { pathname: '/' };
  const { pathname, search, hash } = from;
  return { pathname, search, hash };
};
