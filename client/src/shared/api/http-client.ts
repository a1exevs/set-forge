import { getAccessToken } from './access-token-store';
import { getApiBaseUrl } from './api-base-url';
import type { ApiErrorItem } from './api-error';
import type { CommonResponseEnvelope } from './common-response';
import { refreshAccessToken } from './refresh-access-token';
import { notifySessionExpired } from './session-expired';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  /** When true, sends Bearer if a token exists and retries once after refresh on 401. */
  auth?: boolean;
  /** Internal: skip the 401 refresh+retry pass (prevents recursion from refresh). */
  skipAuthRetry?: boolean;
  signal?: AbortSignal;
};

/** A request that did not succeed: the HTTP status (0 when no answer came) and the envelope of its errors. */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly envelope: CommonResponseEnvelope<unknown>;

  constructor(status: number, envelope: CommonResponseEnvelope<unknown>) {
    super(envelope.messages[0] ?? `HTTP ${status}`);
    this.name = 'ApiRequestError';
    this.status = status;
    this.envelope = envelope;
  }

  get errors(): ApiErrorItem[] {
    return this.envelope.fieldsErrors;
  }
}

// A failure without the server's envelope still answers with one, under a client code the interface can translate.
const failureEnvelope = <T>(
  code: 'NETWORK_ERROR' | 'UNEXPECTED_RESPONSE',
  message: string,
): CommonResponseEnvelope<T> => ({
  data: null,
  messages: [message],
  fieldsErrors: [{ code, params: {}, message }],
  resultCode: -1,
});

const isEnvelope = (body: unknown): body is CommonResponseEnvelope<unknown> =>
  typeof body === 'object' &&
  body !== null &&
  'messages' in body &&
  Array.isArray(body.messages) &&
  'fieldsErrors' in body &&
  Array.isArray(body.fieldsErrors) &&
  'resultCode' in body &&
  typeof body.resultCode === 'number';

const parseEnvelope = async <T>(response: Response): Promise<CommonResponseEnvelope<T>> => {
  const unexpected = response.ok ? 'Unexpected response format' : `HTTP ${response.status}`;
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return failureEnvelope('UNEXPECTED_RESPONSE', unexpected);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return failureEnvelope('UNEXPECTED_RESPONSE', unexpected);
  }
  return isEnvelope(body) ? (body as CommonResponseEnvelope<T>) : failureEnvelope('UNEXPECTED_RESPONSE', unexpected);
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

  const exec = async (): Promise<Response> => {
    try {
      return await fetch(url, {
        method,
        credentials: 'include',
        headers: buildHeaders(auth, hasJsonBody),
        body: hasJsonBody ? JSON.stringify(body) : undefined,
        signal,
      });
    } catch (error: unknown) {
      // A cancelled request stays a cancellation for its caller (React Query drops it), not an error to show.
      if (signal?.aborted) {
        throw error;
      }
      throw new ApiRequestError(0, failureEnvelope('NETWORK_ERROR', 'Network error'));
    }
  };

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
