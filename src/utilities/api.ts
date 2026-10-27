import type { paths } from '@/types/api';

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

type Path<M extends Method> = {
  [P in keyof paths]: paths[P] extends Record<M, unknown> ? P : never;
}[keyof paths];

type ParamNames<P> = P extends `${string}{${infer Name}}${infer Rest}` ? Name | ParamNames<Rest> : never;

type Operation<M extends Method, P extends Path<M>> = paths[P][M];

type Json<T> = T extends { content: { 'application/json': infer B } } ? B : null;

type Responses<O> = O extends { responses: infer R } ? R : never;

type Body<O> = O extends { requestBody: { content: { 'application/json': infer B } } } ? B : never;

type RequestOptions = { signal?: AbortSignal };

type OptionsArgs<P> = [ParamNames<P>] extends [never]
  ? [options?: RequestOptions]
  : [options: RequestOptions & { params: Record<ParamNames<P>, string> }];

type Query<O> = O extends { parameters: { query?: infer Q } } ? Q : never;

type QueryOption<P extends Path<'get'>> = [Query<Operation<'get', P>>] extends [never] ? unknown : { query?: Query<Operation<'get', P>> };

type GetOptionsArgs<P extends Path<'get'>> = [ParamNames<P>] extends [never]
  ? [options?: RequestOptions & QueryOption<P>]
  : [options: RequestOptions & QueryOption<P> & { params: Record<ParamNames<P>, string> }];

type BodyArgs<P, O> = [Body<O>] extends [never] ? [body?: undefined, ...OptionsArgs<P>] : [body: Body<O>, ...OptionsArgs<P>];

export type ApiResponse<M extends Method, P extends Path<M>> = Json<
  Responses<Operation<M, P>>[keyof Responses<Operation<M, P>> & (200 | 201 | 202 | 204)]
>;

const resolvePath = (path: string, params: Partial<Record<string, string>> = {}) =>
  path.replace(/\{(\w+)\}/g, (_, name: string) => encodeURIComponent(params[name] ?? ''));

const withQuery = (path: string, query: unknown) => {
  if (typeof query !== 'object' || !query) return path;
  const search = new URLSearchParams(Object.entries(query).flatMap(([key, value]) => (value === undefined ? [] : [[key, String(value)]])));
  return search.size ? `${path}?${search}` : path;
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

const encode = (body: unknown) => {
  if (body === undefined) return { headers: undefined, body: undefined };
  if (body instanceof Blob) return { headers: { 'Content-Type': body.type }, body };
  return { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
};

const RETRY_DELAYS_MS = [1000, 3000];
const GATEWAY_ERRORS = new Set([502, 504]);

// Only for requests that are safe to repeat, which is to say GETs.
const sendWithRetries = async (path: string, init: RequestInit): Promise<Response> => {
  for (const delay of RETRY_DELAYS_MS) {
    try {
      const response = await send(path, init);
      if (!GATEWAY_ERRORS.has(response.status)) return response;
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return send(path, init);
};

const request = async <T>(method: string, path: string, body?: unknown, { signal }: RequestOptions = {}): Promise<T> => {
  const init = { method, credentials: 'include' as const, ...encode(body), signal };
  const response = await (method === 'GET' ? sendWithRetries(path, init) : send(path, init));

  const data = await parseBody(response);

  if (!response.ok) {
    if (response.status === 401) onUnauthorized?.();
    throw new ApiError(response.status, parseErrors(data) ?? 'Something went wrong on our end. Please try again in a moment.');
  }

  return data as T;
};

const paramsOf = (options?: RequestOptions & { params?: Partial<Record<string, string>> }) => options?.params;

export const get = <P extends Path<'get'>>(path: P, ...[options]: GetOptionsArgs<P>) =>
  request<ApiResponse<'get', P>>(
    'GET',
    withQuery(resolvePath(path, paramsOf(options)), options && 'query' in options && options.query),
    undefined,
    options,
  );

export const post = <P extends Path<'post'>>(path: P, ...[body, options]: BodyArgs<P, Operation<'post', P>>) =>
  request<ApiResponse<'post', P>>('POST', resolvePath(path, paramsOf(options)), body, options);

export const upload = <P extends Path<'post'>>(path: P, file: Blob, ...[options]: OptionsArgs<P>) =>
  request<ApiResponse<'post', P>>('POST', resolvePath(path, paramsOf(options)), file, options);

export const put = <P extends Path<'put'>>(path: P, ...[body, options]: BodyArgs<P, Operation<'put', P>>) =>
  request<ApiResponse<'put', P>>('PUT', resolvePath(path, paramsOf(options)), body, options);

export const patch = <P extends Path<'patch'>>(path: P, ...[body, options]: BodyArgs<P, Operation<'patch', P>>) =>
  request<ApiResponse<'patch', P>>('PATCH', resolvePath(path, paramsOf(options)), body, options);

export const del = <P extends Path<'delete'>>(path: P, ...[options]: OptionsArgs<P>) =>
  request<ApiResponse<'delete', P>>('DELETE', resolvePath(path, paramsOf(options)), undefined, options);
