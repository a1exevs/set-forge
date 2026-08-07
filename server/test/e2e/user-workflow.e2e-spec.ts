import '@root/string.extensions';

import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { ErrorMessages, ResultCodes, Routes } from '@common/constants';
import { createTestApp } from '@test/e2e/create-test-app';

describe('User workflow', () => {
  let app: INestApplication;
  let userId;
  let accessToken;
  let cookies;
  let workoutListId;
  let exerciseId;

  const userEmail = 'user1@gmail.com';
  const userPassword = '12345678';
  const api = '/api/1.0';

  const workoutListPayload = {
    name: 'Push Day',
    description: 'Chest, shoulders, triceps',
    exercises: [{ name: 'Bench Press', muscleGroup: 'chest', weight: 60, reps: 10, sets: 3 }],
  };

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe(Routes.ENDPOINT_AUTH, () => {
    describe('/registration POST', () => {
      it('Register user (bad request - email and password are numbers)', () => {
        return request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_AUTH}/registration`)
          .send({ email: 1, password: 2 })
          .expect(HttpStatus.BAD_REQUEST)
          .expect(response => {
            expect(response.body.data).toBeNull();
            expect(response.body.resultCode).toBe(ResultCodes.ERROR);
          });
      });

      it('Register user', () => {
        return request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_AUTH}/registration`)
          .send({ email: userEmail, password: userPassword, consent: true, termsAccepted: true })
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
        return request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_AUTH}/registration`)
          .send({ email: userEmail, password: userPassword, consent: true, termsAccepted: true })
          .expect(HttpStatus.BAD_REQUEST)
          .expect(response => {
            expect(response.body.data).toBeNull();
            expect(response.body.messages[0]).toBe(ErrorMessages.USER_ALREADY_EXISTS);
            expect(response.body.resultCode).toBe(ResultCodes.ERROR);
          });
      });
    });

    describe('/login POST', () => {
      it('Login (unauthorized)', () => {
        return request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_AUTH}/login`)
          .send({ email: userEmail, password: `${userPassword}123` })
          .expect(HttpStatus.UNAUTHORIZED)
          .expect(response => {
            expect(response.body.messages[0]).toBe(ErrorMessages.INVALID_EMAIL_OR_PASSWORD);
            expect(response.body.resultCode).toBe(ResultCodes.ERROR);
          });
      });

      it('Login', () => {
        return request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_AUTH}/login`)
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
        return request(app.getHttpServer())
          .get(`${api}/${Routes.ENDPOINT_SECURITY}/get-captcha-url`)
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
        return request(app.getHttpServer())
          .get(`${api}/${Routes.ENDPOINT_AUTH}/me`)
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.data.id).toBe(userId);
            expect(response.body.data.email).toBe(userEmail);
            expect(response.body.data.documentsPendingAcceptance).toBe(false);
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });

    describe('/refresh POST', () => {
      it('Refresh Access Token', () => {
        return request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_AUTH}/refresh`)
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
        return request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}`)
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
        return request(app.getHttpServer())
          .get(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}`)
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
        return request(app.getHttpServer())
          .get(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}/${workoutListId}`)
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
        return request(app.getHttpServer())
          .put(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}/${workoutListId}`)
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            ...workoutListPayload,
            name: 'Updated Push Day',
            exercises: workoutListPayload.exercises.map(exercise => ({
              ...exercise,
              id: exerciseId,
            })),
          })
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.data.name).toBe('Updated Push Day');
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });

    describe('/export GET', () => {
      it('Export workout lists', () => {
        return request(app.getHttpServer())
          .get(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}/export`)
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
          .expect(response => {
            expect(response.body.data.formatVersion).toBe(1);
            expect(response.body.data.app).toBe('set-forge');
            expect(response.body.data.workoutLists.some(list => list.name === 'Updated Push Day')).toBeTruthy();
            expect(response.body.data.workoutLists[0].exercises[0].id).toBeUndefined();
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });

    describe('/import POST', () => {
      it('Import workout lists', () => {
        const importPayload = {
          formatVersion: 1,
          app: 'set-forge',
          exportedAt: new Date().toISOString(),
          workoutLists: [
            {
              name: 'Imported Day',
              description: 'legs',
              exercises: [{ name: 'Squat', muscleGroup: 'legs', weight: 100, reps: 5, sets: 5 }],
            },
          ],
        };

        return request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}/import`)
          .set('Cookie', cookies)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(importPayload)
          .expect(HttpStatus.CREATED)
          .expect(response => {
            expect(response.body.data.importedCount).toBe(1);
            expect(response.body.data.lists[0].name).toBe('Imported Day');
            expect(response.body.resultCode).toBe(ResultCodes.OK);
          });
      });
    });

    describe('/:id DELETE', () => {
      it('Delete workout list', () => {
        return request(app.getHttpServer())
          .delete(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}/${workoutListId}`)
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
        return request(app.getHttpServer())
          .delete(`${api}/${Routes.ENDPOINT_AUTH}/logout`)
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
