import { HttpStatus } from '@nestjs/common';

import { Routes } from '@common/constants';

import * as request from 'supertest';

describe('Authorized user methods', () => {
  let URL;

  beforeAll(() => {
    const baseURL = process.env.SERVER_URL;
    const port = process.env.PORT;
    URL = `${baseURL}:${port}/api/1.0/`;
  });

  describe(Routes.ENDPOINT_AUTH, () => {
    describe('/me GET', () => {
      it('Get current user', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .get('/me')
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('/refresh POST', () => {
      it('Refresh Access Token', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .post('/refresh')
          .expect(HttpStatus.FORBIDDEN);
      });
    });

    describe('/logout DELETE', () => {
      it('Logout', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .delete('/logout')
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe(Routes.ENDPOINT_WORKOUT_LISTS, () => {
    describe('/ GET', () => {
      it('Get workout lists', () => {
        return request(URL + Routes.ENDPOINT_WORKOUT_LISTS).get('').expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('/ POST', () => {
      it('Create workout list', () => {
        return request(URL + Routes.ENDPOINT_WORKOUT_LISTS)
          .post('')
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
