type QueryParams = Record<string, string | number | boolean | undefined | null>;

const toQueryString = (params?: QueryParams): string => {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.append(key, String(value));
  }
  return search.size ? `?${search}` : '';
};

const parseErrors = (body: unknown): string | null => {
  if (typeof body !== 'object' || body === null || !('errors' in body)) return null;
  const { errors } = body as { errors: unknown };
  if (Array.isArray(errors)) return errors.filter((message) => typeof message === 'string').join('\n') || null;
  return typeof errors === 'string' ? errors : null;
};

const request = async <T>(method: string, path: string, body?: unknown): Promise<T> => {
  const response = await fetch(path, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) throw new Error(parseErrors(data) ?? `Request failed with status ${response.status}`);

  return data as T;
};

export const get = <T>(path: string, params?: QueryParams): Promise<T> => request<T>('GET', `${path}${toQueryString(params)}`);

export const post = <T>(path: string, body?: unknown): Promise<T> => request<T>('POST', path, body);
