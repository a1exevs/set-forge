import { validateDto } from '@test/unit/helpers';

import {
  WORKOUT_LISTS_EXPORT_APP,
  WORKOUT_LISTS_EXPORT_FORMAT_VERSION,
} from '@workout-lists/dto/workout-lists-export-file.response';
import { ImportWorkoutListsRequest } from '@workout-lists/dto/import-workout-lists.request';

describe('ImportWorkoutListsRequest.Dto', () => {
  const validExercise = { name: 'Bench Press', muscleGroup: 'chest' as const, weight: 60, reps: 10, sets: 3 };

  it('accepts a valid export file payload', async () => {
    const errors = await validateDto(ImportWorkoutListsRequest.Dto, {
      formatVersion: WORKOUT_LISTS_EXPORT_FORMAT_VERSION,
      app: WORKOUT_LISTS_EXPORT_APP,
      exportedAt: '2026-06-03T12:00:00.000Z',
      workoutLists: [{ name: 'Push Day', description: 'Chest', exercises: [validExercise] }],
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects an unsupported app value', async () => {
    const errors = await validateDto(ImportWorkoutListsRequest.Dto, {
      formatVersion: WORKOUT_LISTS_EXPORT_FORMAT_VERSION,
      app: 'other-app' as typeof WORKOUT_LISTS_EXPORT_APP,
      exportedAt: '2026-06-03T12:00:00.000Z',
      workoutLists: [{ name: 'Push Day', description: 'Chest', exercises: [validExercise] }],
    });
    expect(errors.some(error => error.property === 'app')).toBe(true);
  });
});
