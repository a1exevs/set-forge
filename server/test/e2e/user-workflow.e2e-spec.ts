import '@root/string.extensions';

import { HttpStatus } from '@nestjs/common';

import { Routes, ResultCodes, ErrorMessages } from '@common/constants';

import * as request from 'supertest';

describe('User workflow', () => {
  let URL;
  let userId;
  let accessToken;
  let cookies;
  let workoutListId;
  let exerciseId;

  const userEmail = 'user1@gmail.com';
  const userPassword = '12345678';

  const workoutListPayload = {
    name: 'Push Day',
    description: 'Chest, shoulders, triceps',
    exercises: [{ name: 'Bench Press', muscleGroup: 'chest', weight: 60, reps: 10, sets: 3 }],
  };

  beforeAll(() => {
    const baseURL = process.env.SERVER_URL;
    const port = process.env.PORT;
    URL = `${baseURL}:${port}/api/1.0/`;
  });

  describe(Routes.ENDPOINT_AUTH, () => {
    describe('/registration POST', () => {
      it('Register user (bad request - email and password are numbers)', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .post('/registration')
          .send({ email: 1, password: 2 })
          .expect(HttpStatus.BAD_REQUEST)
          .expect(response => {
            expect(response.body.data).toBeNull();
            expect(response.body.resultCode).toBe(ResultCodes.ERROR);
          });
      });

      it('Register user', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .post('/registration')
          .send({ email: userEmail, password: userPassword })
          .expect(HttpStatus.CREATED)
          .expect(response => {
            expect(response.body.data).toBeDefined();
            expect(response.body.data.userId).toBeDefined();
            userId = response.body.data.userId;
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.get('Set-Cookie')[0]).toBeDefined();
            expect(response.get('Set-Cookie')[0].includes('refreshToken')).toBeTruthy();
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });

      it('Register user (bad request - user was registered before)', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .post('/registration')
          .send({ email: userEmail, password: userPassword })
          .expect(HttpStatus.BAD_REQUEST)
          .expect(response => {
            expect(response.body.data).toBeNull();
            expect(response.body.messages[0]).toBe(ErrorMessages.ru.USER_ALREADY_EXISTS);
            expect(response.body.resultCode).toBe(ResultCodes.ERROR);
          });
      });
    });

    describe('/login POST', () => {
      it('Login (unauthorized)', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .post('/login')
          .send({ email: userEmail, password: `${userPassword}123` })
          .expect(HttpStatus.UNAUTHORIZED)
          .expect(response => {
            expect(response.body.messages[0]).toBe(ErrorMessages.ru.INVALID_EMAIL_OR_PASSWORD);
            expect(response.body.resultCode).toBe(ResultCodes.ERROR);
          });
      });

      it('Login', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .post('/login')
          .send({ email: userEmail, password: userPassword })
          .expect(HttpStatus.CREATED)
          .expect(response => {
            expect(response.body.data.userId).toBe(userId);
            accessToken = response.body.data.accessToken;
            cookies = response.get('Set-Cookie');
            expect(cookies[0]).toBeDefined();
            expect(cookies[0].includes('refreshToken')).toBeTruthy();
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });
  });

  describe(Routes.ENDPOINT_SECURITY, () => {
    describe('/get-captcha-url GET', () => {
      it('Get captcha URL', () => {
        return request(URL + Routes.ENDPOINT_SECURITY)
          .get('/get-captcha-url')
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.data.captchaURL).toBeDefined();
            expect(response.body.data.captchaURL.startsWith('data:image/svg+xml;base64,')).toBeTruthy();
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });
  });

  describe(Routes.ENDPOINT_AUTH, () => {
    describe('/me GET', () => {
      it('Get current user', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .get('/me')
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.data.id).toBe(userId);
            expect(response.body.data.email).toBe(userEmail);
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });

    describe('/refresh POST', () => {
      it('Refresh Access Token', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .post('/refresh')
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.CREATED)
          .expect(response => {
            expect(response.body.data.userId).toBe(userId);
            accessToken = response.body.data.accessToken;
            cookies = response.get('Set-Cookie');
            expect(cookies[0].includes('refreshToken')).toBeTruthy();
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });
  });

  describe(Routes.ENDPOINT_WORKOUT_LISTS, () => {
    describe('/ POST', () => {
      it('Create workout list', () => {
        return request(URL + Routes.ENDPOINT_WORKOUT_LISTS)
          .post('')
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(workoutListPayload)
          .expect(HttpStatus.CREATED)
          .expect(response => {
            expect(response.body.data.id).toBeDefined();
            workoutListId = response.body.data.id;
            expect(response.body.data.name).toBe(workoutListPayload.name);
            expect(response.body.data.exercises.length).toBe(1);
            exerciseId = response.body.data.exercises[0].id;
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });

    describe('/ GET', () => {
      it('Get workout lists', () => {
        return request(URL + Routes.ENDPOINT_WORKOUT_LISTS)
          .get('')
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.data.some(list => list.id === workoutListId)).toBeTruthy();
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });

    describe('/:id GET', () => {
      it('Get workout list by id', () => {
        return request(URL + Routes.ENDPOINT_WORKOUT_LISTS)
          .get(`/${workoutListId}`)
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.data.id).toBe(workoutListId);
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });

    describe('/:id PUT', () => {
      it('Update workout list', () => {
        return request(URL + Routes.ENDPOINT_WORKOUT_LISTS)
          .put(`/${workoutListId}`)
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            ...workoutListPayload,
            name: 'Updated Push Day',
          })
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.data.name).toBe('Updated Push Day');
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });

    describe('/:id/exercises/:exerciseId/progress PATCH', () => {
      it('Increment exercise progress', () => {
        return request(URL + Routes.ENDPOINT_WORKOUT_LISTS)
          .patch(`/${workoutListId}/exercises/${exerciseId}/progress`)
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.data.exercises[0].completedSets).toBe(1);
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });

    describe('/:id/reset POST', () => {
      it('Reset workout progress', () => {
        return request(URL + Routes.ENDPOINT_WORKOUT_LISTS)
          .post(`/${workoutListId}/reset`)
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.CREATED)
          .expect(response => {
            expect(response.body.data.exercises[0].completedSets).toBe(0);
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });

    describe('/:id DELETE', () => {
      it('Delete workout list', () => {
        return request(URL + Routes.ENDPOINT_WORKOUT_LISTS)
          .delete(`/${workoutListId}`)
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.data.result).toBe(true);
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });
  });

  describe(Routes.ENDPOINT_AUTH, () => {
    describe('/logout DELETE', () => {
      it('Logout', () => {
        return request(URL + Routes.ENDPOINT_AUTH)
          .delete('/logout')
          .auth(accessToken, { type: 'bearer' })
          .set('Cookie', cookies)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.result).toBe(true);
            cookies = response.get('Set-Cookie');
            expect(cookies[0]).toBeDefined();
            expect(cookies[0].includes('refreshToken=;')).toBeTruthy();
          });
      });
    });
  });
});
