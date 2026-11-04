import { HttpStatus, INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { createHash } from 'node:crypto';
import * as request from 'supertest';

import { RefreshToken } from '@auth/refresh-tokens.model';
import { MAX_SIGNED_IN_DEVICES } from '@auth/refresh-tokens.service';
import { Routes } from '@common/constants';
import { createTestApp } from '@test/e2e/create-test-app';
import { registerAndLogin } from '@test/e2e/e2e-auth.helper';

/** A sign-in beyond the device limit ends the session that refreshed least recently and keeps every other one. */
describe('Signed-in devices', () => {
  let app: INestApplication;
  let refreshTokenModel: typeof RefreshToken;
  const api = '/api/1.0';
  const email = 'signed-in-devices@example.com';
  const password = 'StrongPass123!';
  const dayInMs = 24 * 60 * 60 * 1000;

  beforeAll(async () => {
    app = await createTestApp();
    refreshTokenModel = app.get<typeof RefreshToken>(getModelToken(RefreshToken));
  });

  afterAll(async () => {
    await app.close();
  });

  const signIn = async (): Promise<string> => {
    const response = await request(app.getHttpServer())
      .post(`${api}/${Routes.ENDPOINT_AUTH}/login`)
      .send({ email, password })
      .expect(HttpStatus.CREATED);
    const cookie = response.get('Set-Cookie').find(item => item.startsWith('refreshToken='));
    if (!cookie) {
      throw new Error('The login set no refresh cookie');
    }
    return cookie.split(';')[0];
  };

  // Tokens issued within one second share their expiry; a distinct one per device fixes which refreshed last.
  const ageDevice = async (cookie: string, daysLeft: number): Promise<void> => {
    const tokenHash = createHash('sha256').update(cookie.slice('refreshToken='.length)).digest('hex');
    await refreshTokenModel.update({ expires: new Date(Date.now() + daysLeft * dayInMs) }, { where: { tokenHash } });
  };

  const refresh = (cookie: string): request.Test =>
    request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_AUTH}/refresh`).set('Cookie', cookie);

  // @invariant session/signed-in-devices
  it('ends only the least recently refreshed device when one more signs in', async () => {
    const { userId } = await registerAndLogin(app, email, password, api);
    await refreshTokenModel.destroy({ where: { userId } });
    const devices: string[] = [];
    for (let device = 1; device <= MAX_SIGNED_IN_DEVICES; device++) {
      const cookie = await signIn();
      await ageDevice(cookie, device);
      devices.push(cookie);
    }

    await signIn();

    expect(await refreshTokenModel.count({ where: { userId } })).toBe(MAX_SIGNED_IN_DEVICES);
    const response = await refresh(devices[0]).expect(HttpStatus.UNAUTHORIZED);
    expect(response.body.fieldsErrors.map(error => error.code)).toEqual(['REFRESH_TOKEN_NOT_FOUND']);
    for (const cookie of devices.slice(1)) {
      await refresh(cookie).expect(HttpStatus.CREATED);
    }
  });

  it("removes the user's expired records on the next sign-in", async () => {
    const { userId } = await registerAndLogin(app, 'signed-in-devices-expired@example.com', password, api);
    await refreshTokenModel.update({ expires: new Date(Date.now() - 1000) }, { where: { userId } });

    await request(app.getHttpServer())
      .post(`${api}/${Routes.ENDPOINT_AUTH}/login`)
      .send({ email: 'signed-in-devices-expired@example.com', password })
      .expect(HttpStatus.CREATED);

    expect(await refreshTokenModel.count({ where: { userId } })).toBe(1);
  });
});
