type QueryParams = Record<string, string | number | boolean | undefined | null>;

type RequestOptions = {
  params?: QueryParams;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let onUnauthorized: (() => void) | undefined;

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

const toQueryString = (params?: QueryParams): string => {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.append(key, String(value));
  }
  return search.size ? `?${search}` : '';
};

const toMessage = (error: unknown): string | null => {
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') return error.message;
  return null;
};

const parseErrors = (body: unknown): string | null => {
  if (typeof body !== 'object' || body === null || !('errors' in body)) return null;
  const { errors } = body;
  if (Array.isArray(errors)) return errors.map(toMessage).filter(Boolean).join('\n') || null;
  return toMessage(errors);
};

const parseBody = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const send = async (path: string, init: RequestInit): Promise<Response> => {
  try {
    return await fetch(path, init);
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new ApiError(0, 'Unable to reach the server. Check your connection and try again.');
  }
};

const request = async <T>(method: string, path: string, body?: unknown, { params, signal }: RequestOptions = {}): Promise<T> => {
  const response = await send(`${path}${toQueryString(params)}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const data = await parseBody(response);

  if (!response.ok) {
    if (response.status === 401) onUnauthorized?.();
    throw new ApiError(response.status, parseErrors(data) ?? `Request failed with status ${response.status}`);
  }

  return data as T;
};

export const get = <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options);

export const post = <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, body, options);

export const put = <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, body, options);

export const patch = <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PATCH', path, body, options);

export const del = <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, undefined, options);
