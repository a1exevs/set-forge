import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';

import { Routes } from '@common/constants';
import { createTestApp } from '@test/e2e/create-test-app';
import { E2eAuthContext, registerAndLogin } from '@test/e2e/e2e-auth.helper';

/**
 * A refresh with a refresh cookie the server does not accept is answered 401 with the reason as its code; a logout
 * succeeds and clears the cookie whatever the state of the cookie, so ending a session never fails on the server.
 */
describe('Session credential status', () => {
  let app: INestApplication;
  const api = '/api/1.0';
  const password = 'StrongPass123!';

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const refreshCookie = (cookies: string[]): string => {
    const cookie = cookies.find(item => item.startsWith('refreshToken='));
    if (!cookie) {
      throw new Error('The response set no refresh cookie');
    }
    return cookie.split(';')[0];
  };

  const refresh = (cookie: string): request.Test =>
    request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_AUTH}/refresh`).set('Cookie', cookie);

  const logout = (ctx: E2eAuthContext, cookie: string): request.Test =>
    request(app.getHttpServer())
      .delete(`${api}/${Routes.ENDPOINT_AUTH}/logout`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .set('Cookie', cookie);

  const expectCode = (response: request.Response, code: string): void => {
    expect(response.body.fieldsErrors.map(error => error.code)).toEqual([code]);
  };

  const expectClearedCookie = (response: request.Response): void => {
    expect(response.body.data.result).toBe(true);
    const cleared = refreshCookie(response.get('Set-Cookie'));
    expect(cleared).toBe('refreshToken=');
  };

  it('answers 401 to a refresh with a damaged cookie', async () => {
    const response = await refresh('refreshToken=damaged').expect(HttpStatus.UNAUTHORIZED);
    expectCode(response, 'REFRESH_TOKEN_IS_MALFORMED');
  });

  it('answers 401 to a refresh with the cookie a previous refresh replaced', async () => {
    const ctx = await registerAndLogin(app, 'credential-rotated@example.com', password, api);
    const previous = refreshCookie(ctx.cookies);

    await refresh(previous).expect(HttpStatus.CREATED);
    const response = await refresh(previous).expect(HttpStatus.UNAUTHORIZED);

    expectCode(response, 'REFRESH_TOKEN_NOT_FOUND');
  });

  it('logs out with a damaged cookie and clears it', async () => {
    const ctx = await registerAndLogin(app, 'credential-damaged@example.com', password, api);

    const response = await logout(ctx, 'refreshToken=damaged').expect(HttpStatus.OK);

    expectClearedCookie(response);
  });

  it('logs out twice with the same cookie, and the cookie no longer refreshes', async () => {
    const ctx = await registerAndLogin(app, 'credential-twice@example.com', password, api);
    const cookie = refreshCookie(ctx.cookies);

    expectClearedCookie(await logout(ctx, cookie).expect(HttpStatus.OK));
    expectClearedCookie(await logout(ctx, cookie).expect(HttpStatus.OK));
    const response = await refresh(cookie).expect(HttpStatus.UNAUTHORIZED);

    expectCode(response, 'REFRESH_TOKEN_NOT_FOUND');
  });

  it('logs out with an expired cookie and removes its record', async () => {
    const ctx = await registerAndLogin(app, 'credential-expired@example.com', password, api);
    const cookie = refreshCookie(ctx.cookies);
    const jwtService = app.get(JwtService);
    const { jti, sub } = jwtService.verify<{ jti: string; sub: string }>(cookie.slice('refreshToken='.length));
    const issuedAt = Math.floor(Date.now() / 1000) - 120;
    const expired = jwtService.sign({ iat: issuedAt }, { expiresIn: 60, jwtid: jti, subject: sub });

    await refresh(`refreshToken=${expired}`).expect(HttpStatus.UNAUTHORIZED);
    expectClearedCookie(await logout(ctx, `refreshToken=${expired}`).expect(HttpStatus.OK));
    const response = await refresh(cookie).expect(HttpStatus.UNAUTHORIZED);

    expectCode(response, 'REFRESH_TOKEN_NOT_FOUND');
  });
});
