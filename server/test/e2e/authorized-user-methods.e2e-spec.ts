import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { Routes } from '@common/constants';
import { createTestApp } from '@test/e2e/create-test-app';

describe('Authorized user methods', () => {
  let app: INestApplication;
  const api = '/api/1.0';

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe(Routes.ENDPOINT_AUTH, () => {
    describe('/me GET', () => {
      it('Get current user', () => {
        return request(app.getHttpServer()).get(`${api}/${Routes.ENDPOINT_AUTH}/me`).expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('/refresh POST', () => {
      it('Refresh Access Token', () => {
        return request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_AUTH}/refresh`).expect(HttpStatus.FORBIDDEN);
      });
    });

    describe('/logout DELETE', () => {
      it('Logout', () => {
        return request(app.getHttpServer())
          .delete(`${api}/${Routes.ENDPOINT_AUTH}/logout`)
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe(Routes.ENDPOINT_WORKOUT_LISTS, () => {
    describe('/ GET', () => {
      it('Get workout lists', () => {
        return request(app.getHttpServer())
          .get(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('/ POST', () => {
      it('Create workout list', () => {
        return request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}`)
          .send({
            name: 'Push Day',
            description: 'Chest workout',
            exercises: [{ name: 'Bench Press', muscleGroup: 'chest', weight: 60, reps: 10, sets: 3 }],
          })
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });
  });
});
