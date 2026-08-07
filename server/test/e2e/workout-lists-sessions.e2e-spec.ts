import { HttpStatus, INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import * as request from 'supertest';

import { ResultCodes, Routes } from '@common/constants';
import { createTestApp } from '@test/e2e/create-test-app';
import { E2eAuthContext, registerAndLogin, withAuth } from '@test/e2e/e2e-auth.helper';
import { WorkoutList } from '@workout-lists/workout-list.model';
import { SESSION_STATUS } from '@workout-sessions/constants/session-status';
import { WorkoutSession } from '@workout-sessions/workout-session.model';

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

    it('stays active on resync even when reduced template sets leave it fully complete', async () => {
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

      // Resync never auto-finishes: the session is left active so workout mode can finish it
      // explicitly (with the celebration) the next time the user enters.
      expect(response.body.data.status).toBe(SESSION_STATUS.ACTIVE);
      expect(response.body.data.finishedAt).toBeNull();
      expect(response.body.data.exercises[0].completedSets).toBe(2);
      expect(response.body.data.exercises[0].sets).toBe(2);
    });
  });

  describe(`${Routes.ENDPOINT_WORKOUT_SESSIONS} history`, () => {
    let completedFirstId: string;
    let completedSecondId: string;

    const createAndFinishSession = async (listName: string): Promise<string> => {
      const created = await withAuth(
        auth,
        request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}`)
          .send({ ...listPayload, name: listName }),
      ).expect(HttpStatus.CREATED);

      const started = await withAuth(
        auth,
        request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}`)
          .send({ workoutListId: created.body.data.id }),
      ).expect(HttpStatus.CREATED);

      const finished = await withAuth(
        auth,
        request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}/${started.body.data.id}/finish`),
      ).expect(HttpStatus.CREATED);

      return finished.body.data.id;
    };

    beforeAll(async () => {
      completedFirstId = await createAndFinishSession('History Day A');
      completedSecondId = await createAndFinishSession('History Day B');
    });

    it('returns completed sessions newest first with pagination metadata', async () => {
      const response = await withAuth(
        auth,
        request(app.getHttpServer()).get(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}?limit=1&offset=0`),
      ).expect(HttpStatus.OK);

      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].id).toBe(completedSecondId);
      expect(response.body.data.items[0].status).toBe(SESSION_STATUS.COMPLETED);
      expect(response.body.data.hasMore).toBe(true);
      expect(response.body.data.total).toBeGreaterThanOrEqual(2);
    });

    it('paginates with offset', async () => {
      const response = await withAuth(
        auth,
        request(app.getHttpServer()).get(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}?limit=1&offset=1`),
      ).expect(HttpStatus.OK);

      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].id).toBe(completedFirstId);
    });

    it('rejects an invalid limit', async () => {
      await withAuth(
        auth,
        request(app.getHttpServer()).get(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}?limit=0`),
      ).expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe(`${Routes.ENDPOINT_WORKOUT_SESSIONS} discard`, () => {
    let workoutListId: string;
    let sessionId: string;

    beforeAll(async () => {
      const created = await withAuth(
        auth,
        request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}`)
          .send({
            name: 'Discard Day',
            description: 'Discard flow',
            exercises: [exercisePayload],
          }),
      ).expect(HttpStatus.CREATED);

      workoutListId = created.body.data.id;

      const started = await withAuth(
        auth,
        request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}`).send({ workoutListId }),
      ).expect(HttpStatus.CREATED);

      sessionId = started.body.data.id;
    });

    it('removes an active session without adding it to history', async () => {
      await withAuth(
        auth,
        request(app.getHttpServer()).delete(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}/${sessionId}`),
      )
        .expect(HttpStatus.OK)
        .expect(response => {
          expect(response.body.data.result).toBe(true);
          expect(response.body.resultCode).toBe(ResultCodes.OK);
        });

      const active = await withAuth(
        auth,
        request(app.getHttpServer()).get(
          `${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}/active?workoutListId=${workoutListId}`,
        ),
      ).expect(HttpStatus.OK);

      expect(active.body.data).toBeNull();

      const history = await withAuth(
        auth,
        request(app.getHttpServer()).get(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}?limit=20&offset=0`),
      ).expect(HttpStatus.OK);

      expect(history.body.data.items.some((item: { id: string }) => item.id === sessionId)).toBe(false);

      const restarted = await withAuth(
        auth,
        request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}`).send({ workoutListId }),
      ).expect(HttpStatus.CREATED);

      expect(restarted.body.data.id).not.toBe(sessionId);
    });

    it('rejects discarding a completed session', async () => {
      const created = await withAuth(
        auth,
        request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}`)
          .send({
            name: 'Completed Discard Day',
            description: '',
            exercises: [exercisePayload],
          }),
      ).expect(HttpStatus.CREATED);

      const listId = created.body.data.id;

      const started = await withAuth(
        auth,
        request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}`).send({ workoutListId: listId }),
      ).expect(HttpStatus.CREATED);

      const completedSessionId = started.body.data.id;

      await withAuth(
        auth,
        request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}/${completedSessionId}/finish`),
      ).expect(HttpStatus.CREATED);

      await withAuth(
        auth,
        request(app.getHttpServer()).delete(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}/${completedSessionId}`),
      ).expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe(`${Routes.ENDPOINT_WORKOUT_LISTS} delete`, () => {
    it('discards an active session when the source list is deleted', async () => {
      const created = await withAuth(
        auth,
        request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}`)
          .send({
            name: 'Delete With Active Session',
            description: '',
            exercises: [exercisePayload],
          }),
      ).expect(HttpStatus.CREATED);

      const listId = created.body.data.id;

      const started = await withAuth(
        auth,
        request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}`).send({ workoutListId: listId }),
      ).expect(HttpStatus.CREATED);

      const sessionId = started.body.data.id;
      const sessionExerciseId = started.body.data.exercises[0].id;

      await withAuth(auth, request(app.getHttpServer()).delete(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}/${listId}`))
        .expect(HttpStatus.OK)
        .expect(response => {
          expect(response.body.data.result).toBe(true);
          expect(response.body.resultCode).toBe(ResultCodes.OK);
        });

      const sessionRepo = app.get<typeof WorkoutSession>(getModelToken(WorkoutSession));
      const deletedSession = await sessionRepo.findByPk(sessionId);
      expect(deletedSession).toBeNull();

      await withAuth(
        auth,
        request(app.getHttpServer()).patch(
          `${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}/${sessionId}/exercises/${sessionExerciseId}/progress`,
        ),
      ).expect(HttpStatus.NOT_FOUND);

      const history = await withAuth(
        auth,
        request(app.getHttpServer()).get(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}?limit=20&offset=0`),
      ).expect(HttpStatus.OK);

      expect(history.body.data.items.some((item: { id: string }) => item.id === sessionId)).toBe(false);
    });

    it('keeps completed sessions in history when the source list is deleted', async () => {
      const created = await withAuth(
        auth,
        request(app.getHttpServer())
          .post(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}`)
          .send({
            name: 'Delete With Completed Session',
            description: '',
            exercises: [exercisePayload],
          }),
      ).expect(HttpStatus.CREATED);

      const listId = created.body.data.id;

      const started = await withAuth(
        auth,
        request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}`).send({ workoutListId: listId }),
      ).expect(HttpStatus.CREATED);

      const completedSessionId = started.body.data.id;

      await withAuth(
        auth,
        request(app.getHttpServer()).post(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}/${completedSessionId}/finish`),
      ).expect(HttpStatus.CREATED);

      await withAuth(
        auth,
        request(app.getHttpServer()).delete(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}/${listId}`),
      ).expect(HttpStatus.OK);

      const sessionRepo = app.get<typeof WorkoutSession>(getModelToken(WorkoutSession));
      const completedSession = await sessionRepo.findByPk(completedSessionId);
      expect(completedSession?.status).toBe(SESSION_STATUS.COMPLETED);
      expect(completedSession?.workoutListId).toBeNull();

      const history = await withAuth(
        auth,
        request(app.getHttpServer()).get(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}?limit=20&offset=0`),
      ).expect(HttpStatus.OK);

      expect(history.body.data.items.some((item: { id: string }) => item.id === completedSessionId)).toBe(true);
    });
  });
});
