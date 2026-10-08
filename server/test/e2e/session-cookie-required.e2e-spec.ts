import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { Routes } from '@common/constants';
import { createTestApp } from '@test/e2e/create-test-app';
import { E2eAuthContext, registerAndLogin } from '@test/e2e/e2e-auth.helper';

/**
 * A request that still carries a valid access token but no session cookie — the state of a tab after the user logged
 * out in another tab — is answered 401, like a missing access token, so the client ends the session on /login right
 * away instead of showing a permission error.
 */
describe('Session cookie required', () => {
  let app: INestApplication;
  let ctx: E2eAuthContext;
  const api = '/api/1.0';

  beforeAll(async () => {
    app = await createTestApp();
    ctx = await registerAndLogin(app, 'session-cookie@example.com', 'StrongPass123!', api);
  });

  afterAll(async () => {
    await app.close();
  });

  const withBearerOnly = (req: request.Test): request.Test => req.set('Authorization', `Bearer ${ctx.accessToken}`);

  it('answers 401 to the current-user request with a valid access token and no cookie', () => {
    return withBearerOnly(request(app.getHttpServer()).get(`${api}/${Routes.ENDPOINT_AUTH}/me`)).expect(
      HttpStatus.UNAUTHORIZED,
    );
  });

  it('answers 401 to a data request with a valid access token and no cookie', () => {
    return withBearerOnly(request(app.getHttpServer()).get(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}`)).expect(
      HttpStatus.UNAUTHORIZED,
    );
  });

  it('answers 401 to the token refresh without a cookie', () => {
    return request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_AUTH}/refresh`).expect(HttpStatus.UNAUTHORIZED);
  });

  it('still answers 200 when the cookie is present', () => {
    return withBearerOnly(request(app.getHttpServer()).get(`${api}/${Routes.ENDPOINT_AUTH}/me`))
      .set('Cookie', ctx.cookies)
      .expect(HttpStatus.OK);
  });
});
