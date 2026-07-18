import { HttpStatus, INestApplication } from '@nestjs/common';

import * as request from 'supertest';

export interface E2eAuthContext {
  userId: number;
  accessToken: string;
  cookies: string[];
}

export async function registerAndLogin(
  app: INestApplication,
  email: string,
  password: string,
  api = '/api/1.0',
): Promise<E2eAuthContext> {
  let userId = 0;

  await request(app.getHttpServer())
    .post(`${api}/auth/registration`)
    .send({ email, password, consent: true, termsAccepted: true })
    .expect(HttpStatus.CREATED)
    .expect(response => {
      userId = response.body.data.userId;
    });

  let accessToken = '';
  let cookies: string[] = [];

  await request(app.getHttpServer())
    .post(`${api}/auth/login`)
    .send({ email, password })
    .expect(HttpStatus.CREATED)
    .expect(response => {
      accessToken = response.body.data.accessToken;
      cookies = response.get('Set-Cookie');
    });

  return { userId, accessToken, cookies };
}

export function withAuth(ctx: E2eAuthContext, req: request.Test): request.Test {
  return req.set('Cookie', ctx.cookies).set('Authorization', `Bearer ${ctx.accessToken}`);
}
