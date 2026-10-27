import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, del, get, patch, post, setUnauthorizedHandler } from '@/utilities/api';

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
    const spy = mockFetch({ user: { id: '1' } });
    const result = await get('/api/users/me');
    expect(result).toEqual({ user: { id: '1' } });
    expect(spy).toHaveBeenCalledWith('/api/users/me', expect.objectContaining({ method: 'GET', credentials: 'include' }));
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

  it('serializes query parameters, skipping undefined ones', async () => {
    const spy = mockFetch({ sessions: [], nextCursor: null });
    await get('/api/users/me/sessions', { query: { limit: 20, cursor: undefined } });
    expect(spy).toHaveBeenCalledWith('/api/users/me/sessions?limit=20', expect.anything());
  });

  it('fills path parameters into the route, encoded', async () => {
    const spy = mockFetch(null, 204);
    await get('/api/users/oauth/{provider}', { params: { provider: 'a/b' } });
    expect(spy).toHaveBeenCalledWith('/api/users/oauth/a%2Fb', expect.anything());
  });

  it('sends PATCH and DELETE with the right methods', async () => {
    const spy = mockFetch(null, 204);
    await patch('/api/users/me', { name: 'Ada' });
    await del('/api/users/me');
    expect(spy.mock.calls.map(([, init]) => init?.method)).toEqual(['PATCH', 'DELETE']);
  });

  it('sends POST without a body or content-type when the route takes none', async () => {
    const spy = mockFetch(null, 204);
    await post('/api/users/logout');
    expect(spy).toHaveBeenCalledWith('/api/users/logout', expect.objectContaining({ method: 'POST', headers: undefined, body: undefined }));
  });

  it('returns null for an empty response', async () => {
    mockFetch(null, 204);
    expect(await post('/api/users/logout')).toBeNull();
  });

  it('forwards an abort signal to fetch', async () => {
    const spy = mockFetch({});
    const controller = new AbortController();
    await get('/api/users/me', { signal: controller.signal });
    expect(spy).toHaveBeenCalledWith('/api/users/me', expect.objectContaining({ signal: controller.signal }));
  });

  it('joins backend error objects into one message', async () => {
    mockFetch({ errors: [{ message: 'Name is required', field: 'name' }, { message: 'Invalid email address' }] }, 400);
    await expect(post('/api/users/register', { name: '', email: '', password: '', turnstileToken: '' })).rejects.toThrow(
      'Name is required\nInvalid email address',
    );
  });

  it('accepts plain string errors', async () => {
    mockFetch({ errors: ['Invalid email or password'] }, 401);
    await expect(post('/api/users/login', { email: '', password: '' })).rejects.toThrow('Invalid email or password');
  });

  it('throws an ApiError carrying the status code', async () => {
    mockFetch({ errors: 'Too many attempts, please try again later' }, 429);
    await expect(post('/api/users/login', { email: '', password: '' })).rejects.toMatchObject({ status: 429, name: 'ApiError' });
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
    const request = post('/api/users/logout');
    await expect(request).rejects.toMatchObject({ name: 'ApiError', status: 0 });
    await expect(request).rejects.toThrow('Unable to reach the server');
  });

  it('rethrows an abort untouched', async () => {
    const controller = new AbortController();
    controller.abort();
    globalThis.fetch = vi.fn<typeof fetch>(async () => {
      throw new DOMException('Aborted', 'AbortError');
    });
    await expect(get('/api/users/me', { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('shows a readable message, not the status, when the error body is unusable', async () => {
    mockFetch(null, 500);
    await expect(get('/api/users/me')).rejects.toThrow('Something went wrong on our end. Please try again in a moment.');
  });
});

describe('GET requests', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('retries a lost request and a gateway error', async () => {
    vi.useFakeTimers();
    const spy = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(new Response(null, { status: 502 }))
      .mockResolvedValueOnce(Response.json({ user: { id: '1' } }));
    globalThis.fetch = spy;

    const request = get('/api/users/me');
    await vi.runAllTimersAsync();

    expect(await request).toEqual({ user: { id: '1' } });
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('gives up with a readable message while the server stays unreachable', async () => {
    vi.useFakeTimers();
    const spy = vi.fn<typeof fetch>(async () => new Response(null, { status: 502 }));
    globalThis.fetch = spy;

    const failed = expect(get('/api/users/me')).rejects.toThrow('Something went wrong on our end. Please try again in a moment.');
    await vi.runAllTimersAsync();
    await failed;
    expect(spy).toHaveBeenCalledTimes(3);
  });
});
