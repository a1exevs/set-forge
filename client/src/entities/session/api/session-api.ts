import { clearAccessToken, getAccessToken, setAccessToken } from 'src/shared/api/access-token.store';
import { getApiBaseUrl } from 'src/shared/api/api-base-url';
import type { CommonResponseEnvelope } from 'src/shared/api/common-response.types';
import { apiRequest } from 'src/shared/api/http-client';
import { ResultCodes } from 'src/shared/api/result-codes';

export function toAbsoluteFromApiOrigin(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const origin = new URL(getApiBaseUrl()).origin;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${origin}${path}`;
}

export type CurrentUser = {
  id: number;
  email: string;
};

type AuthData = { userId: number; accessToken: string };

export async function postRegistration(email: string, password: string): Promise<AuthData> {
  const res = await apiRequest<AuthData>('/auth/registration', {
    method: 'POST',
    body: { email, password },
  });
  if (res.resultCode !== ResultCodes.OK || !res.data) {
    throw new Error(res.messages[0] ?? 'Registration failed');
  }
  setAccessToken(res.data.accessToken);
  return res.data;
}

export async function postLogin(email: string, password: string, captcha?: string): Promise<AuthData> {
  const body: { email: string; password: string; captcha?: string } = { email, password };
  if (captcha !== undefined && captcha.length > 0) {
    body.captcha = captcha;
  }
  const res = await apiRequest<AuthData>('/auth/login', {
    method: 'POST',
    body,
  });
  if (res.resultCode !== ResultCodes.OK || !res.data) {
    throw new Error(res.messages[0] ?? 'Login failed');
  }
  setAccessToken(res.data.accessToken);
  return res.data;
}

export async function getCaptchaUrl(): Promise<string> {
  const res = await apiRequest<{ captchaURL: string }>('/security/get-captcha-url', {
    method: 'GET',
  });
  if (res.resultCode !== ResultCodes.OK || !res.data?.captchaURL) {
    throw new Error(res.messages[0] ?? 'Could not load captcha');
  }
  return toAbsoluteFromApiOrigin(res.data.captchaURL);
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  if (!getAccessToken()) {
    return null;
  }
  try {
    const res = await apiRequest<CurrentUser>('/auth/me', {
      method: 'GET',
      auth: true,
    });
    if (res.resultCode !== ResultCodes.OK || !res.data) {
      return null;
    }
    return res.data;
  } catch {
    return null;
  }
}

export async function deleteLogout(): Promise<void> {
  try {
    await apiRequest<unknown>('/auth/logout', {
      method: 'DELETE',
      auth: true,
    });
  } finally {
    clearAccessToken();
  }
}

export function isNeedCaptchaEnvelope(envelope: CommonResponseEnvelope<unknown>): boolean {
  return envelope.resultCode === ResultCodes.NEED_CAPTCHA_AUTHORIZATION;
}
