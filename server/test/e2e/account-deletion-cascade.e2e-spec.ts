import '@root/string.extensions';

import { HttpStatus, INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';

import { Routes, ResultCodes } from '@common/constants';
import { User } from '@users/users.model';
import { UserRole } from '@users/users-roles.model';
import { RefreshToken } from '@auth/refresh-tokens.model';
import { WorkoutList } from '@workout-lists/workout-list.model';
import { WorkoutExercise } from '@workout-lists/workout-exercise.model';
import { WorkoutSession } from '@workout-sessions/workout-session.model';
import { WorkoutSessionExercise } from '@workout-sessions/workout-session-exercise.model';

import * as request from 'supertest';

import { createTestApp } from '@test/e2e/create-test-app';

/**
 * Verifies that deleting the current account removes the user together with ALL user-owned
 * data via the DB-level `ON DELETE CASCADE` foreign keys defined in the migrations:
 *   users → workout_lists → workout_exercises
 *   users → workout_sessions → workout_session_exercises
 *   users → refreshTokens
 *   users → users_roles
 */
describe('Account deletion cascade', () => {
  let app: INestApplication;

  let userModel: typeof User;
  let userRoleModel: typeof UserRole;
  let refreshTokenModel: typeof RefreshToken;
  let workoutListModel: typeof WorkoutList;
  let workoutExerciseModel: typeof WorkoutExercise;
  let workoutSessionModel: typeof WorkoutSession;
  let workoutSessionExerciseModel: typeof WorkoutSessionExercise;

  let userId: number;
  let accessToken: string;
  let cookies: string[];
  let workoutListId: string;
  let workoutSessionId: string;

  const api = '/api/1.0';
  const userEmail = 'cascade-user@gmail.com';
  const userPassword = '12345678';

  const workoutListPayload = {
    name: 'Push Day',
    description: 'Chest, shoulders, triceps',
    exercises: [{ name: 'Bench Press', muscleGroup: 'chest', weight: 60, reps: 10, sets: 3 }],
  };

  beforeAll(async () => {
    app = await createTestApp();
    userModel = app.get(getModelToken(User));
    userRoleModel = app.get(getModelToken(UserRole));
    refreshTokenModel = app.get(getModelToken(RefreshToken));
    workoutListModel = app.get(getModelToken(WorkoutList));
    workoutExerciseModel = app.get(getModelToken(WorkoutExercise));
    workoutSessionModel = app.get(getModelToken(WorkoutSession));
    workoutSessionExerciseModel = app.get(getModelToken(WorkoutSessionExercise));
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a user', () => {
    return request(app.getHttpServer())
      .post(`${api}/${Routes.ENDPOINT_AUTH}/registration`)
      .send({ email: userEmail, password: userPassword, consent: true })
      .expect(HttpStatus.CREATED)
      .expect(response => {
        userId = response.body.data.userId;
        accessToken = response.body.data.accessToken;
        cookies = response.get('Set-Cookie');
        expect(userId).toBeDefined();
      });
  });

  it('creates a workout list with an exercise', () => {
    return request(app.getHttpServer())
      .post(`${api}/${Routes.ENDPOINT_WORKOUT_LISTS}`)
      .set('Cookie', cookies)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(workoutListPayload)
      .expect(HttpStatus.CREATED)
      .expect(response => {
        workoutListId = response.body.data.id;
        expect(response.body.data.exercises.length).toBe(1);
      });
  });

  it('starts a workout session (creates session + session exercises)', () => {
    return request(app.getHttpServer())
      .post(`${api}/${Routes.ENDPOINT_WORKOUT_SESSIONS}`)
      .set('Cookie', cookies)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ workoutListId })
      .expect(HttpStatus.CREATED)
      .expect(response => {
        workoutSessionId = response.body.data.id;
        expect(response.body.data.exercises.length).toBe(1);
      });
  });

  it('has data across all user-owned tables before deletion', async () => {
    expect(await workoutListModel.count({ where: { userId } })).toBeGreaterThan(0);
    expect(await workoutExerciseModel.count({ where: { workoutListId } })).toBeGreaterThan(0);
    expect(await workoutSessionModel.count({ where: { userId } })).toBeGreaterThan(0);
    expect(await workoutSessionExerciseModel.count({ where: { workoutSessionId } })).toBeGreaterThan(0);
    expect(await refreshTokenModel.count({ where: { userId } })).toBeGreaterThan(0);
    expect(await userRoleModel.count({ where: { userId } })).toBeGreaterThan(0);
  });

  it('deletes the account', () => {
    return request(app.getHttpServer())
      .delete(`${api}/${Routes.ENDPOINT_AUTH}/account`)
      .auth(accessToken, { type: 'bearer' })
      .set('Cookie', cookies)
      .expect(HttpStatus.OK)
      .expect(response => {
        expect(response.body.data.result).toBe(true);
        expect(response.body.resultCode).toBe(ResultCodes.OK);
        const setCookie = response.get('Set-Cookie');
        expect(setCookie[0].includes('refreshToken=;')).toBeTruthy();
      });
  });

  it('cascaded: the user and every related row are gone', async () => {
    expect(await userModel.findByPk(userId)).toBeNull();
    expect(await userRoleModel.count({ where: { userId } })).toBe(0);
    expect(await refreshTokenModel.count({ where: { userId } })).toBe(0);
    expect(await workoutListModel.count({ where: { userId } })).toBe(0);
    expect(await workoutExerciseModel.count({ where: { workoutListId } })).toBe(0);
    expect(await workoutSessionModel.count({ where: { userId } })).toBe(0);
    expect(await workoutSessionExerciseModel.count({ where: { workoutSessionId } })).toBe(0);
  });
});
