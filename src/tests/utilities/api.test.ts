import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, del, get, patch, post, put, setUnauthorizedHandler } from '@/utilities/api';

const mockFetch = (body: unknown, status = 200) => {
  const spy = vi.fn<typeof fetch>(async () => (status === 204 ? new Response(null, { status }) : Response.json(body, { status })));
  globalThis.fetch = spy;
  return spy;
};

afterEach(() => {
  vi.restoreAllMocks();
  setUnauthorizedHandler(() => {});
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
    await get('/api/users', { params: { limit: 20, offset: 0, search: undefined, active: null } });
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

  it('sends PUT, PATCH, and DELETE with the right methods', async () => {
    const spy = mockFetch(null, 204);
    await put('/api/items/1', { name: 'a' });
    await patch('/api/items/1', { name: 'b' });
    await del('/api/items/1');
    expect(spy.mock.calls.map(([, init]) => init?.method)).toEqual(['PUT', 'PATCH', 'DELETE']);
  });

  it('returns null for an empty response', async () => {
    mockFetch(null, 204);
    expect(await del('/api/items/1')).toBeNull();
  });

  it('forwards an abort signal to fetch', async () => {
    const spy = mockFetch({});
    const controller = new AbortController();
    await get('/api/users', { signal: controller.signal });
    expect(spy).toHaveBeenCalledWith('/api/users', expect.objectContaining({ signal: controller.signal }));
  });

  it('joins backend error objects into one message', async () => {
    mockFetch({ errors: [{ message: 'Name is required', field: 'name' }, { message: 'Invalid email address' }] }, 400);
    await expect(post('/api/users/register', {})).rejects.toThrow('Name is required\nInvalid email address');
  });

  it('accepts plain string errors', async () => {
    mockFetch({ errors: ['Invalid email or password'] }, 401);
    await expect(post('/api/users/login', {})).rejects.toThrow('Invalid email or password');
  });

  it('throws an ApiError carrying the status code', async () => {
    mockFetch({ errors: 'Too many attempts, please try again later' }, 429);
    await expect(post('/api/users/login', {})).rejects.toMatchObject({ status: 429, name: 'ApiError' });
  });

  it('invokes the unauthorized handler on a 401', async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    mockFetch({ errors: 'Session expired' }, 401);
    await expect(get('/api/users/me')).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('turns a network failure into an ApiError with a readable message', async () => {
    globalThis.fetch = vi.fn<typeof fetch>(async () => {
      throw new TypeError('Failed to fetch');
    });
    const request = get('/api/users');
    await expect(request).rejects.toMatchObject({ name: 'ApiError', status: 0 });
    await expect(request).rejects.toThrow('Unable to reach the server');
  });

  it('rethrows an abort untouched', async () => {
    const controller = new AbortController();
    controller.abort();
    globalThis.fetch = vi.fn<typeof fetch>(async () => {
      throw new DOMException('Aborted', 'AbortError');
    });
    await expect(get('/api/users', { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('falls back to the status when the error body is unusable', async () => {
    mockFetch(null, 500);
    await expect(get('/api/users')).rejects.toThrow('Request failed with status 500');
  });
});
