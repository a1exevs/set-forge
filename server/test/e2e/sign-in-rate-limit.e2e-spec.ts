import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { SIGN_IN_ATTEMPTS_PER_MINUTE } from '@auth/sign-in-attempts.service';
import { Routes } from '@common/constants';
import { createTestApp } from '@test/e2e/create-test-app';

const api = '/api/1.0';

const codesOf = (response: request.Response): string[] =>
  response.body.fieldsErrors.map((error: { code: string }) => error.code);

/**
 * The real limit, not the raised one of the e2e env; each test sends from its own address through the one proxy hop
 * the e2e env trusts, the way the production proxies pass the client's address on.
 */
// @invariant session/sign-in-rate-limit
describe('Sign-in rate limit', () => {
  let app: INestApplication;
  let raised: string | undefined;

  beforeAll(async () => {
    raised = process.env.SIGN_IN_ATTEMPTS_PER_MINUTE;
    process.env.SIGN_IN_ATTEMPTS_PER_MINUTE = String(SIGN_IN_ATTEMPTS_PER_MINUTE);
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
    if (raised === undefined) {
      delete process.env.SIGN_IN_ATTEMPTS_PER_MINUTE;
    } else {
      process.env.SIGN_IN_ATTEMPTS_PER_MINUTE = raised;
    }
  });

  const login = (address: string): request.Test =>
    request(app.getHttpServer())
      .post(`${api}/${Routes.ENDPOINT_AUTH}/login`)
      .set('X-Forwarded-For', address)
      .send({ email: `rate-${address}@example.com`, password: 'WrongPass123!' });

  const useUpTheLimit = async (address: string): Promise<void> => {
    for (let i = 0; i < SIGN_IN_ATTEMPTS_PER_MINUTE; i++) {
      await login(address).expect(response => expect(response.status).not.toBe(HttpStatus.TOO_MANY_REQUESTS));
    }
  };

  it('refuses the attempt after the limit of a minute, saying how long to wait', async () => {
    await useUpTheLimit('198.51.100.10');

    await login('198.51.100.10')
      .expect(HttpStatus.TOO_MANY_REQUESTS)
      .expect(response => {
        expect(codesOf(response)).toEqual(['TOO_MANY_SIGN_IN_ATTEMPTS']);
        const seconds = Number(response.get('Retry-After'));
        expect(seconds).toBeGreaterThanOrEqual(1);
        expect(seconds).toBeLessThanOrEqual(60);
        expect(response.body.fieldsErrors[0].params).toEqual({ seconds });
      });
  });

  it('limits nothing else of that address', async () => {
    await useUpTheLimit('198.51.100.11');
    await login('198.51.100.11').expect(HttpStatus.TOO_MANY_REQUESTS);

    await request(app.getHttpServer())
      .get(`${api}/${Routes.ENDPOINT_SECURITY}/get-captcha-url`)
      .set('X-Forwarded-For', '198.51.100.11')
      .expect(HttpStatus.OK);
    await request(app.getHttpServer())
      .post(`${api}/${Routes.ENDPOINT_AUTH}/registration`)
      .set('X-Forwarded-For', '198.51.100.11')
      .send({
        email: 'rate-limited-registers@example.com',
        password: 'StrongPass123!',
        consent: true,
        termsAccepted: true,
      })
      .expect(HttpStatus.CREATED);
  });

  it('counts every client by its own address behind the proxy', async () => {
    await useUpTheLimit('198.51.100.12');
    await login('198.51.100.12').expect(HttpStatus.TOO_MANY_REQUESTS);

    await login('198.51.100.13').expect(response => expect(response.status).toBe(HttpStatus.UNAUTHORIZED));
  });
});
