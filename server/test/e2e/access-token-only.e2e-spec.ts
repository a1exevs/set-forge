import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';

import { Routes } from '@common/constants';
import { createTestApp } from '@test/e2e/create-test-app';
import { E2eAuthContext, registerAndLogin } from '@test/e2e/e2e-auth.helper';

/**
 * Only the access token the server issued opens a protected route: the refresh token, or a JWT on the same secret
 * minted for anything else, is answered 401 — never a server error further down.
 */
describe('Access token only', () => {
  let app: INestApplication;
  let ctx: E2eAuthContext;
  let refreshValue: string;
  const api = '/api/1.0';

  beforeAll(async () => {
    app = await createTestApp();
    ctx = await registerAndLogin(app, 'access-token-only@example.com', 'StrongPass123!', api);
    const cookie = ctx.cookies.find(item => item.startsWith('refreshToken='));
    if (!cookie) {
      throw new Error('The login set no refresh cookie');
    }
    refreshValue = cookie.split(';')[0].slice('refreshToken='.length);
  });

  afterAll(async () => {
    await app.close();
  });

  const getAs = (path: string, bearer: string): request.Test =>
    request(app.getHttpServer())
      .get(`${api}/${path}`)
      .set('Authorization', `Bearer ${bearer}`)
      .set('Cookie', ctx.cookies);

  // @invariant session/access-token-only
  it('answers 401 to the refresh token sent as the access token', async () => {
    await getAs(`${Routes.ENDPOINT_AUTH}/me`, refreshValue).expect(HttpStatus.UNAUTHORIZED);
    await getAs(Routes.ENDPOINT_WORKOUT_LISTS, refreshValue).expect(HttpStatus.UNAUTHORIZED);
  });

  // @invariant session/access-token-only
  it('answers 401 to a JWT on the same secret without the claims of an access token', async () => {
    const foreign = app.get(JwtService).sign({ id: ctx.userId }, { issuer: 'someone-else', audience: 'someone-else' });

    await getAs(`${Routes.ENDPOINT_AUTH}/me`, foreign).expect(HttpStatus.UNAUTHORIZED);
  });

  it('answers 200 to the access token the server issued', async () => {
    await getAs(`${Routes.ENDPOINT_AUTH}/me`, ctx.accessToken).expect(HttpStatus.OK);
    await getAs(Routes.ENDPOINT_WORKOUT_LISTS, ctx.accessToken).expect(HttpStatus.OK);
  });
});
