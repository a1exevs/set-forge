import { getAccessToken } from 'src/shared/api/access-token.store';
import { getApiBaseUrl } from 'src/shared/api/api-base-url';
import type { CommonResponseEnvelope } from 'src/shared/api/common-response.types';
import { refreshAccessToken } from 'src/shared/api/refresh-access-token';
import { notifySessionExpired } from 'src/shared/api/session-expired';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  /** When true, sends Bearer if a token exists and retries once after refresh on 401. */
  auth?: boolean;
  /** Internal: skip the 401 refresh+retry pass (prevents recursion from refresh). */
  skipAuthRetry?: boolean;
  signal?: AbortSignal;
};

export class ApiRequestError extends Error {
  readonly status: number;
  readonly envelope: CommonResponseEnvelope<unknown>;

  constructor(status: number, envelope: CommonResponseEnvelope<unknown>) {
    super(envelope.messages[0] ?? `HTTP ${status}`);
    this.name = 'ApiRequestError';
    this.status = status;
    this.envelope = envelope;
  }
}

const parseEnvelope = async <T>(response: Response): Promise<CommonResponseEnvelope<T>> => {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return {
      data: null as T,
      messages: [response.ok ? 'Unexpected response format' : `HTTP ${response.status}`],
      fieldsErrors: [],
      resultCode: -1,
    };
  }

  try {
    return (await response.json()) as CommonResponseEnvelope<T>;
  } catch {
    return {
      data: null as T,
      messages: [response.ok ? 'Invalid JSON response' : `HTTP ${response.status}`],
      fieldsErrors: [],
      resultCode: -1,
    };
  }
};

const buildHeaders = (auth: boolean, hasJsonBody: boolean): HeadersInit => {
  const headers: Record<string, string> = {};
  if (hasJsonBody) {
    headers['Content-Type'] = 'application/json';
  }
  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<CommonResponseEnvelope<T>> {
  const { method = 'GET', body, auth = false, skipAuthRetry = false, signal } = options;
  const hasJsonBody = body !== undefined && body !== null;
  const url = path.startsWith('http') ? path : `${getApiBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`;

  const exec = async (): Promise<Response> =>
    fetch(url, {
      method,
      credentials: 'include',
      headers: buildHeaders(auth, hasJsonBody),
      body: hasJsonBody ? JSON.stringify(body) : undefined,
      signal,
    });

  let response = await exec();

  if (response.status === 401 && auth && !skipAuthRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await exec();
    } else {
      notifySessionExpired();
    }
  }

  const json = await parseEnvelope<T>(response);

  if (!response.ok) {
    throw new ApiRequestError(response.status, json);
  }

  return json;
}
