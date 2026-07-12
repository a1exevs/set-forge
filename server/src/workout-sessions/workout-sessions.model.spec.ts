import { Sequelize } from 'sequelize-typescript';

import { User } from '@users/users.model';
import { UserRole } from '@users/users-roles.model';
import { Role } from '@roles/roles.model';
import { WorkoutList } from '@workout-lists/workout-list.model';
import { WorkoutExercise } from '@workout-lists/workout-exercise.model';
import { WorkoutSession } from '@workout-sessions/workout-session.model';
import { WorkoutSessionExercise } from '@workout-sessions/workout-session-exercise.model';
import { SESSION_STATUS } from '@workout-sessions/constants/session-status';

describe('Workout session models', () => {
  beforeAll(() => {
    // Initialize model metadata (and resolve associations) without opening a DB connection.
    const sequelize = new Sequelize({ dialect: 'mysql', validateOnly: true } as never);
    sequelize.addModels([User, Role, UserRole, WorkoutList, WorkoutExercise, WorkoutSession, WorkoutSessionExercise]);
  });

  describe('WorkoutSession', () => {
    it('maps to the workout_sessions table', () => {
      expect(WorkoutSession.getTableName()).toBe('workout_sessions');
    });

    it('declares the expected columns', () => {
      const attributes = WorkoutSession.getAttributes();
      expect(Object.keys(attributes).sort()).toEqual(
        ['id', 'userId', 'workoutListId', 'workoutListName', 'status', 'startedAt', 'finishedAt'].sort(),
      );
    });

    it('defaults status to active and allows a null finishedAt / workoutListId', () => {
      const attributes = WorkoutSession.getAttributes();
      expect(attributes.status.defaultValue).toBe(SESSION_STATUS.ACTIVE);
      expect(attributes.finishedAt.allowNull).toBe(true);
      expect(attributes.workoutListId.allowNull).toBe(true);
      expect(attributes.workoutListName.allowNull).toBe(false);
      expect(attributes.userId.allowNull).toBe(false);
    });

    it('has many session exercises', () => {
      expect(WorkoutSession.associations.exercises).toBeDefined();
      expect(WorkoutSession.associations.exercises.target).toBe(WorkoutSessionExercise);
    });
  });

  describe('WorkoutSessionExercise', () => {
    it('maps to the workout_session_exercises table', () => {
      expect(WorkoutSessionExercise.getTableName()).toBe('workout_session_exercises');
    });

    it('declares the expected snapshot columns', () => {
      const attributes = WorkoutSessionExercise.getAttributes();
      expect(Object.keys(attributes).sort()).toEqual(
        [
          'id',
          'workoutSessionId',
          'sourceExerciseId',
          'name',
          'muscleGroup',
          'weight',
          'reps',
          'sets',
          'completedSets',
          'position',
        ].sort(),
      );
    });

    it('defaults completedSets to 0 and allows a null sourceExerciseId', () => {
      const attributes = WorkoutSessionExercise.getAttributes();
      expect(attributes.completedSets.defaultValue).toBe(0);
      expect(attributes.sourceExerciseId.allowNull).toBe(true);
      expect(attributes.workoutSessionId.allowNull).toBe(false);
    });
  });
});
