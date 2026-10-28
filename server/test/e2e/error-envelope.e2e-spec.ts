import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { ResultCodes, Routes } from '@common/constants';
import { createTestApp } from '@test/e2e/create-test-app';
import { E2eAuthContext, registerAndLogin, withAuth } from '@test/e2e/e2e-auth.helper';

/**
 * Every response but the health check leaves in the envelope — the errors Nest raises itself (a guard, routing, body
 * parsing) too — and every error in it carries its code.
 */
describe('Error envelope', () => {
  let app: INestApplication;
  let ctx: E2eAuthContext;
  const api = '/api/1.0';
  const email = 'error-envelope@example.com';
  const password = 'StrongPass123!';

  beforeAll(async () => {
    app = await createTestApp();
    ctx = await registerAndLogin(app, email, password, api);
  });

  afterAll(async () => {
    await app.close();
  });

  const expectError = (body: request.Response['body'], code: string): void => {
    expect(body.data).toBeNull();
    expect(body.resultCode).toBe(ResultCodes.ERROR);
    expect(body.fieldsErrors).toEqual([expect.objectContaining({ code, params: {} })]);
    expect(body.messages).toEqual([body.fieldsErrors[0].message]);
  };

  it('answers the health check outside the envelope', () => {
    return request(app.getHttpServer())
      .get(`${api}/${Routes.HEALTH}`)
      .expect(HttpStatus.OK)
      .expect(response => expect(response.body).toEqual({ status: 'ok' }));
  });

  it('answers a guard failure in the envelope', () => {
    return request(app.getHttpServer())
      .get(`${api}/${Routes.ENDPOINT_AUTH}/me`)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect(response => expectError(response.body, 'UNAUTHORIZED'));
  });

  it('answers an unknown route in the envelope', () => {
    return request(app.getHttpServer())
      .get(`${api}/nowhere`)
      .expect(HttpStatus.NOT_FOUND)
      .expect(response => expectError(response.body, 'NOT_FOUND'));
  });

  it('answers a malformed JSON body in the envelope', () => {
    return request(app.getHttpServer())
      .post(`${api}/${Routes.ENDPOINT_AUTH}/login`)
      .set('Content-Type', 'application/json')
      .send('{"email":')
      .expect(HttpStatus.BAD_REQUEST)
      .expect(response => expectError(response.body, 'BAD_REQUEST'));
  });

  it('answers a body over the size limit in the envelope', () => {
    return request(app.getHttpServer())
      .post(`${api}/${Routes.ENDPOINT_AUTH}/login`)
      .send({ email, password: 'x'.repeat(200 * 1024) })
      .expect(HttpStatus.PAYLOAD_TOO_LARGE)
      .expect(response => expectError(response.body, 'PAYLOAD_TOO_LARGE'));
  });

  it('answers a validation error with an item per field, a nested one as a dotted path', () => {
    return withAuth(ctx, request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}`))
      .send({
        name: 'Push Day',
        description: '',
        exercises: [{ name: 1, muscleGroup: 'chest', weight: 60, reps: 0, sets: 3 }],
      })
      .expect(HttpStatus.BAD_REQUEST)
      .expect(response => {
        expect(response.body.fieldsErrors).toEqual([
          { code: 'MUST_BE_A_STRING', params: {}, field: 'exercises.0.name', message: 'Must be a string' },
          {
            code: 'NUMERIC_MUST_NOT_BE_LESS_THAN_N',
            params: { min: 1 },
            field: 'exercises.0.reps',
            message: 'Must not be less than 1',
          },
        ]);
        expect(response.body.messages).toEqual([
          'exercises.0.name - Must be a string',
          'exercises.0.reps - Must not be less than 1',
        ]);
      });
  });

  // @invariant session/captcha-counts-login-only
  describe('the captcha counts failed sign-ins only', () => {
    const failLogin = (agent: ReturnType<typeof request.agent>): request.Test =>
      agent.post(`${api}/${Routes.ENDPOINT_AUTH}/login`).send({ email, password: 'WrongPass123!' });

    it('asks for no captcha when other requests of the session failed', async () => {
      const agent = request.agent(app.getHttpServer());
      await failLogin(agent).expect(HttpStatus.UNAUTHORIZED);
      for (let i = 0; i < 5; i++) {
        await agent.get(`${api}/${Routes.ENDPOINT_AUTH}/me`).expect(HttpStatus.UNAUTHORIZED);
      }

      await failLogin(agent)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect(response => expect(response.body.resultCode).toBe(ResultCodes.ERROR));
      await agent
        .post(`${api}/${Routes.ENDPOINT_AUTH}/login`)
        .send({ email, password })
        .expect(HttpStatus.CREATED)
        .expect(response => expect(response.body.resultCode).toBe(ResultCodes.OK));
    });

    it('asks for the captcha after five failed sign-ins', async () => {
      const agent = request.agent(app.getHttpServer());
      for (let i = 0; i < 4; i++) {
        await failLogin(agent).expect(response => expect(response.body.resultCode).toBe(ResultCodes.ERROR));
      }

      await failLogin(agent)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect(response => {
          expect(response.body.resultCode).toBe(ResultCodes.NEED_CAPTCHA_AUTHORIZATION);
          expect(response.body.fieldsErrors.map(error => error.code)).toEqual([
            'INVALID_EMAIL_OR_PASSWORD',
            'NEED_AUTHORIZATION_WITH_CAPTCHA',
          ]);
        });
      await agent
        .post(`${api}/${Routes.ENDPOINT_AUTH}/login`)
        .send({ email, password, captcha: 'wrong' })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect(response => {
          expect(response.body.resultCode).toBe(ResultCodes.NEED_CAPTCHA_AUTHORIZATION);
          expect(response.body.fieldsErrors.map(error => error.code)).toEqual(['NEED_AUTHORIZATION_WITH_CAPTCHA']);
        });
    });
  });
});
