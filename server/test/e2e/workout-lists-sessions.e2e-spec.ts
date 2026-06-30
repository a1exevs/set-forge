import { HttpStatus, INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';

import { Routes, ResultCodes } from '@common/constants';
import { WorkoutList } from '@workout-lists/workout-list.model';
import { SESSION_STATUS } from '@workout-sessions/constants/session-status';

import * as request from 'supertest';

import { createTestApp } from '@test/e2e/create-test-app';
import { E2eAuthContext, registerAndLogin, withAuth } from '@test/e2e/e2e-auth.helper';

describe('Workout lists and sessions business logic', () => {
  let app: INestApplication;
  let auth: E2eAuthContext;

  const api = '/api/1.0';
  const password = '12345678';
  const email = `workout-e2e-${Date.now()}@test.com`;

  const exercisePayload = { name: 'Bench Press', muscleGroup: 'chest', weight: 60, reps: 10, sets: 4 };

  const listPayload = {
    name: 'Push Day',
    description: 'Chest workout',
    exercises: [exercisePayload],
  };

  beforeAll(async () => {
    app = await createTestApp();
    auth = await registerAndLogin(app, email, password, api);
  });

  afterAll(async () => {
    await app.close();
  });

  describe(Routes.ENDPOINT_WORKOUT_LISTS, () => {
    it('rejects create with an empty exercises array', async () => {
      await withAuth(
        auth,
        request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}`).send({
          name: 'Empty Day',
          description: '',
          exercises: [],
        }),
      )
        .expect(HttpStatus.BAD_REQUEST)
        .expect(response => {
          expect(response.body.resultCode).toBe(ResultCodes.ERROR);
        });
    });

    it('creates a list and returns exercises in position order', async () => {
      await withAuth(
        auth,
        request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}`).send(listPayload),
      )
        .expect(HttpStatus.CREATED)
        .expect(response => {
          expect(response.body.data.id).toBeDefined();
          expect(response.body.data.exercises).toHaveLength(1);
          expect(response.body.data.exercises[0].sets).toBe(4);
          expect(response.body.resultCode).toBe(ResultCodes.OK);
        });
    });

    it('rejects update that clears all exercises', async () => {
      const created = await withAuth(
        auth,
        request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}`)
          .send({
            ...listPayload,
            name: 'To Clear',
          }),
      ).expect(HttpStatus.CREATED);

      const listId = created.body.data.id;

      await withAuth(
        auth,
        request(app.getHttpServer())
          .put(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}/${listId}`)
          .send({ name: 'To Clear', description: '', exercises: [] }),
      )
        .expect(HttpStatus.BAD_REQUEST)
        .expect(response => {
          expect(response.body.resultCode).toBe(ResultCodes.ERROR);
        });
    });
  });

  describe(Routes.ENDPOINT_WORKOUT_SESSIONS, () => {
    let workoutListId: string;
    let templateExerciseId: string;
    let sessionId: string;
    let sessionExerciseId: string;

    beforeAll(async () => {
      const created = await withAuth(
        auth,
        request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}`)
          .send({
            ...listPayload,
            name: 'Session Day',
          }),
      ).expect(HttpStatus.CREATED);

      workoutListId = created.body.data.id;
      templateExerciseId = created.body.data.exercises[0].id;
    });

    it('rejects start when the workout list has no exercises', async () => {
      const listRepo = app.get<typeof WorkoutList>(getModelToken(WorkoutList));
      const emptyList = await listRepo.create({
        userId: auth.userId,
        name: 'Empty List',
        description: '',
        createdAt: new Date(),
        lastUsedAt: null,
      });

      await withAuth(
        auth,
        request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}`).send({
          workoutListId: emptyList.id,
        }),
      )
        .expect(HttpStatus.BAD_REQUEST)
        .expect(response => {
          expect(response.body.resultCode).toBe(ResultCodes.ERROR);
        });
    });

    it('starts a new session with 201 and snapshots template exercises', async () => {
      const response = await withAuth(
        auth,
        request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}`).send({ workoutListId }),
      ).expect(HttpStatus.CREATED);

      sessionId = response.body.data.id;
      sessionExerciseId = response.body.data.exercises[0].id;

      expect(response.body.data.status).toBe(SESSION_STATUS.ACTIVE);
      expect(response.body.data.exercises).toHaveLength(1);
      expect(response.body.data.exercises[0].sourceExerciseId).toBe(templateExerciseId);
      expect(response.body.data.exercises[0].completedSets).toBe(0);
      expect(response.body.data.exercises[0].sets).toBe(4);
      expect(response.body.resultCode).toBe(ResultCodes.OK);
    });

    it('resumes the active session with 200 without creating a duplicate', async () => {
      const response = await withAuth(
        auth,
        request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}`).send({ workoutListId }),
      ).expect(HttpStatus.OK);

      expect(response.body.data.id).toBe(sessionId);
      expect(response.body.data.status).toBe(SESSION_STATUS.ACTIVE);
    });

    it('returns the active session for a list via query param', async () => {
      await withAuth(
        auth,
        request(app.getHttpServer()).get(
          `${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}/active?workoutListId=${workoutListId}`,
        ),
      )
        .expect(HttpStatus.OK)
        .expect(response => {
          expect(response.body.data.id).toBe(sessionId);
        });
    });

    it('rejects active lookup without a valid workoutListId query', async () => {
      await withAuth(
        auth,
        request(app.getHttpServer()).get(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}/active`),
      ).expect(HttpStatus.BAD_REQUEST);
    });

    it('increments session exercise progress', async () => {
      await withAuth(
        auth,
        request(app.getHttpServer()).patch(
          `${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}/${sessionId}/exercises/${sessionExerciseId}/progress`,
        ),
      )
        .expect(HttpStatus.OK)
        .expect(response => {
          expect(response.body.data.exercises[0].completedSets).toBe(1);
        });
    });

    it('auto-finishes the session when the last set is completed', async () => {
      await withAuth(
        auth,
        request(app.getHttpServer()).patch(
          `${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}/${sessionId}/exercises/${sessionExerciseId}/progress`,
        ),
      ).expect(HttpStatus.OK);
      await withAuth(
        auth,
        request(app.getHttpServer()).patch(
          `${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}/${sessionId}/exercises/${sessionExerciseId}/progress`,
        ),
      ).expect(HttpStatus.OK);

      const response = await withAuth(
        auth,
        request(app.getHttpServer()).patch(
          `${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}/${sessionId}/exercises/${sessionExerciseId}/progress`,
        ),
      ).expect(HttpStatus.OK);

      expect(response.body.data.status).toBe(SESSION_STATUS.COMPLETED);
      expect(response.body.data.finishedAt).toBeTruthy();
      expect(response.body.data.exercises[0].completedSets).toBe(4);
    });
  });

  describe(`${Routes.ENDPOINT_WORKOUT_SESSIONS} resync`, () => {
    let workoutListId: string;
    let templateExerciseId: string;
    let sessionId: string;
    let sessionExerciseId: string;

    beforeAll(async () => {
      const created = await withAuth(
        auth,
        request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}`)
          .send({
            name: 'Resync Day',
            description: 'Resync flow',
            exercises: [{ ...exercisePayload, sets: 4 }],
          }),
      ).expect(HttpStatus.CREATED);

      workoutListId = created.body.data.id;
      templateExerciseId = created.body.data.exercises[0].id;

      const started = await withAuth(
        auth,
        request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}`).send({ workoutListId }),
      ).expect(HttpStatus.CREATED);

      sessionId = started.body.data.id;
      sessionExerciseId = started.body.data.exercises[0].id;

      for (let i = 0; i < 3; i += 1) {
        await withAuth(
          auth,
          request(app.getHttpServer()).patch(
            `${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}/${sessionId}/exercises/${sessionExerciseId}/progress`,
          ),
        ).expect(HttpStatus.OK);
      }
    });

    it('auto-finishes on resync when template sets are reduced below preserved progress', async () => {
      await withAuth(
        auth,
        request(app.getHttpServer())
          .put(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}/${workoutListId}`)
          .send({
            name: 'Resync Day',
            description: 'Resync flow',
            exercises: [
              {
                id: templateExerciseId,
                name: 'Bench Press',
                muscleGroup: 'chest',
                weight: 60,
                reps: 10,
                sets: 2,
              },
            ],
          }),
      ).expect(HttpStatus.OK);

      const response = await withAuth(
        auth,
        request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}/${sessionId}/resync`),
      ).expect(HttpStatus.CREATED);

      expect(response.body.data.status).toBe(SESSION_STATUS.COMPLETED);
      expect(response.body.data.finishedAt).toBeTruthy();
      expect(response.body.data.exercises[0].completedSets).toBe(2);
      expect(response.body.data.exercises[0].sets).toBe(2);
    });
  });
});
