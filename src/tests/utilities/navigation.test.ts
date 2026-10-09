import { describe, expect, it } from 'vitest';

import { redirectTarget } from '@/utilities/navigation';

describe('redirectTarget', () => {
  it('returns the full saved location', () => {
    expect(redirectTarget({ from: { pathname: '/settings', search: '?tab=billing', hash: '#card' } })).toEqual({
      pathname: '/settings',
      search: '?tab=billing',
      hash: '#card',
    });
  });

  it.each([
    undefined,
    null,
    {},
    { from: '/settings' },
    { from: { pathname: 'settings' } },
    { from: { pathname: '//evil.example' } },
    { from: { pathname: '/\\evil.example' } },
  ])('falls back to / for %j', (state) => {
    expect(redirectTarget(state)).toEqual({ pathname: '/' });
  });
});
