import { HttpStatus, INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import * as request from 'supertest';

import { RefreshToken } from '@auth/refresh-tokens.model';
import { RefreshTokensService } from '@auth/refresh-tokens.service';
import { Routes } from '@common/constants';
import { createTestApp } from '@test/e2e/create-test-app';
import { registerAndLogin, withAuth } from '@test/e2e/e2e-auth.helper';
import { User } from '@users/users.model';
import { UsersService } from '@users/users.service';

type Response = request.Response;

/** Requests that overlap on the server: each race is pinned by holding one step until the other side got there. */
describe('Auth under concurrent requests', () => {
  let app: INestApplication;
  let refreshTokenModel: typeof RefreshToken;
  let userModel: typeof User;
  let refreshTokensService: RefreshTokensService;
  let usersService: UsersService;
  const api = '/api/1.0';
  const auth = `${api}/${Routes.ENDPOINT_AUTH}`;
  const password = 'StrongPass123!';

  beforeAll(async () => {
    app = await createTestApp();
    refreshTokenModel = app.get<typeof RefreshToken>(getModelToken(RefreshToken));
    userModel = app.get<typeof User>(getModelToken(User));
    refreshTokensService = app.get(RefreshTokensService);
    usersService = app.get(UsersService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  const send = (test: request.Test): Promise<Response> => test.then(response => response);
  const codes = (response: Response): string[] => (response.body.fieldsErrors ?? []).map(error => error.code);

  /** Lets `parties` calls of the method run their real body, then holds each one until all of them have. */
  const meetAfter = <T extends object>(target: T, method: keyof T & string, parties: number): void => {
    const original = (target[method] as (...args: unknown[]) => Promise<unknown>).bind(target);
    let arrived = 0;
    let release: () => void = () => undefined;
    const everyone = new Promise<void>(resolve => (release = resolve));
    jest.spyOn(target, method as never).mockImplementation((async (...args: unknown[]) => {
      const result = await original(...args);
      arrived += 1;
      if (arrived === parties) {
        release();
      }
      await everyone;
      return result;
    }) as never);
  };

  // @invariant session/refresh-token-single-use
  it('gives one refresh token to only one of two parallel refreshes', async () => {
    const ctx = await registerAndLogin(app, 'race-refresh@example.com', password, api);
    const devices = await refreshTokenModel.count({ where: { userId: ctx.userId } });
    meetAfter(refreshTokensService, 'findTokenByHash', 2);

    const responses = await Promise.all([
      send(request(app.getHttpServer()).post(`${auth}/refresh`).set('Cookie', ctx.cookies)),
      send(request(app.getHttpServer()).post(`${auth}/refresh`).set('Cookie', ctx.cookies)),
    ]);

    expect(responses.map(response => response.status).sort()).toEqual([HttpStatus.CREATED, HttpStatus.UNAUTHORIZED]);
    expect(responses.filter(response => response.status === HttpStatus.UNAUTHORIZED).map(codes)).toEqual([
      ['REFRESH_TOKEN_NOT_FOUND'],
    ]);
    expect(await refreshTokenModel.count({ where: { userId: ctx.userId } })).toBe(devices);
  });

  // @invariant session/refresh-token-single-use
  it('refuses a refresh that read its token before a logout removed it', async () => {
    const ctx = await registerAndLogin(app, 'race-logout@example.com', password, api);
    const devices = await refreshTokenModel.count({ where: { userId: ctx.userId } });
    const original = refreshTokensService.findTokenByHash.bind(refreshTokensService);
    let readDone: () => void = () => undefined;
    const tokenRead = new Promise<void>(resolve => (readDone = resolve));
    let logoutDone: () => void = () => undefined;
    const loggedOut = new Promise<void>(resolve => (logoutDone = resolve));
    jest.spyOn(refreshTokensService, 'findTokenByHash').mockImplementation(async tokenHash => {
      const token = await original(tokenHash);
      readDone();
      await loggedOut;
      return token;
    });

    const refresh = send(request(app.getHttpServer()).post(`${auth}/refresh`).set('Cookie', ctx.cookies));
    await tokenRead;
    await withAuth(ctx, request(app.getHttpServer()).delete(`${auth}/logout`)).expect(HttpStatus.OK);
    logoutDone();

    expect((await refresh).status).toBe(HttpStatus.UNAUTHORIZED);
    expect(await refreshTokenModel.count({ where: { userId: ctx.userId } })).toBe(devices - 1);
  });

  // @invariant session/email-unique
  it('answers USER_ALREADY_EXISTS to the loser of two parallel registrations with one email', async () => {
    const email = 'race-registration@example.com';
    meetAfter(usersService, 'getUserByEmail', 2);
    const register = (): Promise<Response> =>
      send(
        request(app.getHttpServer())
          .post(`${auth}/registration`)
          .send({ email, password, consent: true, termsAccepted: true }),
      );

    const responses = await Promise.all([register(), register()]);

    expect(responses.map(response => response.status).sort()).toEqual([HttpStatus.CREATED, HttpStatus.CONFLICT]);
    expect(responses.filter(response => response.status === HttpStatus.CONFLICT).map(codes)).toEqual([
      ['USER_ALREADY_EXISTS'],
    ]);
  });

  // @invariant session/user-has-role
  it('leaves no user behind when its role cannot be stored, so the email registers again', async () => {
    const email = 'role-failure@example.com';
    const body = { email, password, consent: true, termsAccepted: true };
    jest.spyOn(User.prototype, '$set').mockRejectedValueOnce(new Error('roles insert failed'));

    await request(app.getHttpServer()).post(`${auth}/registration`).send(body);

    expect(await userModel.count({ where: { email } })).toBe(0);
    await request(app.getHttpServer()).post(`${auth}/registration`).send(body).expect(HttpStatus.CREATED);
  });

  // @invariant session/deletion-during-sign-in
  it('answers 401 to a login whose account is deleted before its refresh token is stored', async () => {
    const email = 'deleted-during-login@example.com';
    const ctx = await registerAndLogin(app, email, password, api);
    const original = refreshTokensService.createRefreshToken.bind(refreshTokensService);
    jest.spyOn(refreshTokensService, 'createRefreshToken').mockImplementationOnce(async (...args) => {
      await usersService.deleteUser(ctx.userId);
      return original(...args);
    });

    const response = await request(app.getHttpServer()).post(`${auth}/login`).send({ email, password });

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  // @invariant session/deletion-during-sign-in
  it('answers 401 to a refresh whose account is deleted before the new refresh token is stored', async () => {
    const ctx = await registerAndLogin(app, 'deleted-during-refresh@example.com', password, api);
    const original = refreshTokensService.createRefreshToken.bind(refreshTokensService);
    jest.spyOn(refreshTokensService, 'createRefreshToken').mockImplementationOnce(async (...args) => {
      await usersService.deleteUser(ctx.userId);
      return original(...args);
    });

    const response = await request(app.getHttpServer()).post(`${auth}/refresh`).set('Cookie', ctx.cookies);

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
