import { createSingleFlight } from '@shared/lib';

import { clearAccessToken, setAccessToken } from './access-token-store';
import { getApiBaseUrl } from './api-base-url';
import type { CommonResponseEnvelope } from './common-response';
import { ResultCodes } from './result-codes';

type AuthPayload = { userId: number; accessToken: string };

async function postRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      clearAccessToken();
      return false;
    }

    const body = (await res.json()) as CommonResponseEnvelope<AuthPayload>;
    if (body.resultCode !== ResultCodes.OK || !body.data?.accessToken) {
      clearAccessToken();
      return false;
    }

    setAccessToken(body.data.accessToken);
    return true;
  } catch {
    clearAccessToken();
    return false;
  }
}

/** Concurrent 401s await the same refresh attempt (session/refresh-single-flight). */
export const refreshAccessToken = createSingleFlight(postRefresh);
