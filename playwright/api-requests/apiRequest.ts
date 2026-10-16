import { env } from 'playwright/util/helper';
import { withRetries } from 'playwright/util/retry';

/**
 * The one place the Playwright API clients talk HTTP.
 *
 * Transient failures are retried (`withRetries`), and every unexpected status becomes an
 * `ApiError` carrying the status and response body — so callers never check `response.ok`
 * themselves, and a spec can react to one status with
 * `error instanceof ApiError && error.status === 404` instead of matching message text.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type QueryValue = string | number | boolean | undefined;
export type Query = Record<string, QueryValue | QueryValue[]>;

export interface RequestOptions {
  /** Sent as `Authorization: Bearer <token>`. */
  token?: string;
  headers?: Record<string, string>;
  /** Sent as a JSON body. */
  json?: unknown;
  /** Sent as an `application/x-www-form-urlencoded` body. */
  form?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    readonly request: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(`API-kall feilet: ${request} svarte ${status}${body ? `. Svar: ${body}` : ''}`);
    this.name = 'ApiError';
  }
}

/** A URL on the platform host (API_BASE_URL), e.g. `https://platform.tt02.altinn.no/...`. */
export function platformUrl(path: string, query?: Query): string {
  return buildUrl(env('API_BASE_URL'), path, query);
}

/**
 * A URL on the app host (BASE_URL origin), where the frontend's BFF endpoints live,
 * e.g. `https://am.ui.tt02.altinn.no/accessmanagement/api/v1/...`.
 */
export function appUrl(path: string, query?: Query): string {
  return buildUrl(new URL(env('BASE_URL')).origin, path, query);
}

/** `base` without a trailing slash, `path` without a leading one. */
export function buildUrl(base: string, path: string, query: Query = {}): string {
  const url = new URL(`${base}/${path}`);
  for (const [key, value] of Object.entries(query)) {
    for (const item of [value].flat()) {
      if (item !== undefined) url.searchParams.append(key, String(item));
    }
  }
  return url.toString();
}

/** Sends the request and returns the response, throwing `ApiError` for an unexpected status. */
export async function send(
  method: HttpMethod,
  url: string,
  { token, headers, json, form }: RequestOptions = {},
): Promise<Response> {
  // Query strings carry test PIDs and long URNs; the path is enough to identify the call.
  const { host, pathname } = new URL(url);
  const request = `${method} ${host}${pathname}`;

  const init: RequestInit = {
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(json !== undefined && { 'Content-Type': 'application/json' }),
      ...(form && { 'Content-Type': 'application/x-www-form-urlencoded' }),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : form && new URLSearchParams(form),
  };

  // A per-attempt timeout, so a hanging call is retried like K6's request timeout
  // instead of eating the whole test timeout. 4 × 20s + 7s backoff fits inside 90s.
  const response = await withRetries(
    () => fetch(url, { ...init, signal: AbortSignal.timeout(20_000) }),
    request,
  );

  if (!response.ok) {
    throw new ApiError(request, response.status, await response.text());
  }
  return response;
}

/**
 * Like `send`, but returns the parsed JSON body — `undefined` for an empty body such as 204.
 */
export async function sendJson<T>(
  method: HttpMethod,
  url: string,
  options?: RequestOptions,
): Promise<T> {
  const response = await send(method, url, options);
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
