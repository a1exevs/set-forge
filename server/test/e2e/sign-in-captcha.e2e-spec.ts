import { HttpStatus, INestApplication } from '@nestjs/common';
import { createClient } from 'redis';
import * as request from 'supertest';

import { CAPTCHA_AFTER_FAILS_PER_ACCOUNT_AND_ADDRESS } from '@auth/sign-in-attempts.service';
import { ResultCodes, Routes } from '@common/constants';
import { CAPTCHA_LIFETIME_SECONDS } from '@security/security.service';
import { REDIS_CLIENT, RedisClient } from '@src/redis';
import { createTestApp } from '@test/e2e/create-test-app';
import { registerAndLogin } from '@test/e2e/e2e-auth.helper';

const api = '/api/1.0';
const password = 'StrongPass123!';
const wrongPassword = 'WrongPass123!';

type LoginBody = { email: string; password: string; captcha?: string; captchaId?: string };

const codesOf = (response: request.Response): string[] =>
  response.body.fieldsErrors.map((error: { code: string }) => error.code);

/**
 * Every request here goes without cookies, the way a guessing script sends them: the counts live on the server, so
 * the captcha comes whatever the client keeps.
 */
// @invariant session/captcha-counts-login-only
describe('Sign-in captcha', () => {
  let app: INestApplication;
  let redis: ReturnType<typeof createClient>;
  let accounts = 0;

  beforeAll(async () => {
    app = await createTestApp();
    // Reads a captcha's answer the way a person reads the image.
    redis = createClient({ socket: { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) } });
    await redis.connect();
  });

  afterAll(async () => {
    await redis.close();
    await app.close();
  });

  const login = (body: LoginBody): request.Test =>
    request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_AUTH}/login`).send(body);

  const newCaptcha = async (): Promise<{ captchaId: string; answer: string }> => {
    const response = await request(app.getHttpServer())
      .get(`${api}/${Routes.ENDPOINT_SECURITY}/get-captcha-url`)
      .expect(HttpStatus.OK);
    const { captchaId } = response.body.data;
    return { captchaId, answer: String((await redis.get(`captcha:${captchaId}`)) ?? '') };
  };

  const newAccount = async (): Promise<string> => {
    const email = `sign-in-captcha-${++accounts}@example.com`;
    await registerAndLogin(app, email, password, api);
    return email;
  };

  const failUntilCaptcha = async (email: string): Promise<void> => {
    for (let i = 0; i < CAPTCHA_AFTER_FAILS_PER_ACCOUNT_AND_ADDRESS; i++) {
      await login({ email, password: wrongPassword }).expect(HttpStatus.UNAUTHORIZED);
    }
  };

  it('demands the captcha with the failure that reaches the threshold and then before checking the password', async () => {
    const email = await newAccount();
    for (let i = 1; i < CAPTCHA_AFTER_FAILS_PER_ACCOUNT_AND_ADDRESS; i++) {
      await login({ email, password: wrongPassword }).expect(response => {
        expect(response.body.resultCode).toBe(ResultCodes.ERROR);
        expect(codesOf(response)).toEqual(['INVALID_EMAIL_OR_PASSWORD']);
      });
    }

    await login({ email, password: wrongPassword })
      .expect(HttpStatus.UNAUTHORIZED)
      .expect(response => {
        expect(response.body.resultCode).toBe(ResultCodes.NEED_CAPTCHA_AUTHORIZATION);
        expect(codesOf(response)).toEqual(['INVALID_EMAIL_OR_PASSWORD', 'NEED_AUTHORIZATION_WITH_CAPTCHA']);
      });
    await login({ email, password })
      .expect(HttpStatus.UNAUTHORIZED)
      .expect(response => {
        expect(response.body.resultCode).toBe(ResultCodes.NEED_CAPTCHA_AUTHORIZATION);
        expect(codesOf(response)).toEqual(['NEED_AUTHORIZATION_WITH_CAPTCHA']);
      });
  });

  it('never counts a failed request elsewhere', async () => {
    const email = await newAccount();
    for (let i = 0; i < CAPTCHA_AFTER_FAILS_PER_ACCOUNT_AND_ADDRESS; i++) {
      await request(app.getHttpServer()).get(`${api}/${Routes.ENDPOINT_AUTH}/me`).expect(HttpStatus.UNAUTHORIZED);
    }

    await login({ email, password: wrongPassword }).expect(response =>
      expect(response.body.resultCode).toBe(ResultCodes.ERROR),
    );
    await login({ email, password }).expect(HttpStatus.CREATED);
  });

  it('keeps demanding the captcha while it is wrong and starts the count over after a sign-in with it', async () => {
    const email = await newAccount();
    await failUntilCaptcha(email);
    const wrong = await newCaptcha();

    await login({ email, password, captchaId: wrong.captchaId, captcha: `${wrong.answer}x` }).expect(response => {
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(response.body.resultCode).toBe(ResultCodes.NEED_CAPTCHA_AUTHORIZATION);
    });
    const right = await newCaptcha();
    await login({ email, password, captchaId: right.captchaId, captcha: right.answer }).expect(HttpStatus.CREATED);

    await login({ email, password: wrongPassword }).expect(response =>
      expect(response.body.resultCode).toBe(ResultCodes.ERROR),
    );
  });

  it('checks one solved captcha against the password once, also when the attempts come at the same moment', async () => {
    const email = await newAccount();
    await failUntilCaptcha(email);
    const { captchaId, answer } = await newCaptcha();

    const responses = await Promise.all(
      Array.from({ length: 4 }, () => login({ email, password: wrongPassword, captchaId, captcha: answer })),
    );

    const checked = responses.filter(response => codesOf(response).includes('INVALID_EMAIL_OR_PASSWORD'));
    expect(checked).toHaveLength(1);
    for (const response of responses.filter(other => !checked.includes(other))) {
      expect(codesOf(response)).toEqual(['NEED_AUTHORIZATION_WITH_CAPTCHA']);
    }
  });

  it('lets only as many overlapping attempts reach the password as the threshold allows', async () => {
    const email = await newAccount();
    const burst = CAPTCHA_AFTER_FAILS_PER_ACCOUNT_AND_ADDRESS + 3;

    const responses = await Promise.all(Array.from({ length: burst }, () => login({ email, password: wrongPassword })));

    const checked = responses.filter(response => codesOf(response).includes('INVALID_EMAIL_OR_PASSWORD'));
    expect(checked).toHaveLength(CAPTCHA_AFTER_FAILS_PER_ACCOUNT_AND_ADDRESS);
  });

  it('answers and counts an unknown email like a wrong password', async () => {
    const email = `sign-in-captcha-nobody-${++accounts}@example.com`;
    for (let i = 1; i < CAPTCHA_AFTER_FAILS_PER_ACCOUNT_AND_ADDRESS; i++) {
      await login({ email, password }).expect(response => {
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(codesOf(response)).toEqual(['INVALID_EMAIL_OR_PASSWORD']);
      });
    }

    await login({ email, password }).expect(response =>
      expect(response.body.resultCode).toBe(ResultCodes.NEED_CAPTCHA_AUTHORIZATION),
    );
  });

  it('keeps a captcha answer for the captcha lifetime only', async () => {
    const { captchaId } = await newCaptcha();

    const ttl = await redis.ttl(`captcha:${captchaId}`);

    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(CAPTCHA_LIFETIME_SECONDS);
  });

  it('sets no session cookie: a sign-in leaves only its refresh cookie and a captcha leaves none', async () => {
    const email = await newAccount();

    const captcha = await request(app.getHttpServer()).get(`${api}/${Routes.ENDPOINT_SECURITY}/get-captcha-url`);
    const failed = await login({ email, password: wrongPassword });
    const signedIn = await login({ email, password }).expect(HttpStatus.CREATED);

    expect(captcha.get('Set-Cookie')).toBeUndefined();
    expect(failed.get('Set-Cookie')).toBeUndefined();
    expect(signedIn.get('Set-Cookie')?.map(cookie => cookie.split('=')[0])).toEqual(['refreshToken']);
  });

  describe('without its store', () => {
    let closedApp: INestApplication;

    beforeAll(async () => {
      closedApp = await createTestApp();
      await closedApp.get<RedisClient>(REDIS_CLIENT).close();
    });

    afterAll(async () => {
      await closedApp.close();
    });

    it('closes the sign-in and the captcha with 503 instead of leaving them unguarded', async () => {
      await request(closedApp.getHttpServer())
        .post(`${api}/${Routes.ENDPOINT_AUTH}/login`)
        .send({ email: 'anyone@example.com', password })
        .expect(HttpStatus.SERVICE_UNAVAILABLE)
        .expect(response => expect(codesOf(response)).toEqual(['SIGN_IN_TEMPORARILY_UNAVAILABLE']));
      await request(closedApp.getHttpServer())
        .get(`${api}/${Routes.ENDPOINT_SECURITY}/get-captcha-url`)
        .expect(HttpStatus.SERVICE_UNAVAILABLE)
        .expect(response => expect(codesOf(response)).toEqual(['SIGN_IN_TEMPORARILY_UNAVAILABLE']));
    });
  });
});
