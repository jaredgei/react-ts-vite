import { afterEach, describe, expect, it, vi } from 'vitest';

import { get, post } from 'utilities/api';

const mockFetch = (body: unknown, init: { ok?: boolean; status?: number } = {}) => {
  const response = {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  };
  const spy = vi.fn(async () => response as unknown as Response);
  globalThis.fetch = spy;
  return spy;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('api', () => {
  it('sends GET with credentials and returns parsed json', async () => {
    const spy = mockFetch({ users: [] });
    const result = await get('/api/users');
    expect(result).toEqual({ users: [] });
    expect(spy).toHaveBeenCalledWith('/api/users', expect.objectContaining({ method: 'GET', credentials: 'include' }));
  });

  it('serializes query params, skipping null and undefined', async () => {
    const spy = mockFetch({ users: [] });
    await get('/api/users', { limit: 20, offset: 0, search: undefined, active: null });
    expect(spy).toHaveBeenCalledWith('/api/users?limit=20&offset=0', expect.anything());
  });

  it('sends POST with a json body and content-type header', async () => {
    const spy = mockFetch({ user: { id: '1' } });
    await post('/api/users/login', { email: 'a@b.co', password: 'secret' });
    expect(spy).toHaveBeenCalledWith(
      '/api/users/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'a@b.co', password: 'secret' }),
      }),
    );
  });

  it('throws an Error joining the backend errors array', async () => {
    mockFetch({ errors: ['Invalid email or password'] }, { ok: false, status: 401 });
    await expect(post('/api/users/login', {})).rejects.toThrow('Invalid email or password');
  });

  it('throws an Error for a string errors field', async () => {
    mockFetch({ errors: 'Too many attempts, please try again later' }, { ok: false, status: 429 });
    await expect(post('/api/users/login', {})).rejects.toThrow('Too many attempts, please try again later');
  });

  it('falls back to the status when the error body is unusable', async () => {
    mockFetch(null, { ok: false, status: 500 });
    await expect(get('/api/users')).rejects.toThrow('Request failed with status 500');
  });
});
