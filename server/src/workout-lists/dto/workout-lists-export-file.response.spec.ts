import { checkForApiProperties } from '@test/unit/helpers';
import {
  WORKOUT_LISTS_EXPORT_APP,
  WORKOUT_LISTS_EXPORT_FORMAT_VERSION,
  WorkoutListsExportFileResponse,
} from '@workout-lists/dto/workout-lists-export-file.response';

describe('WorkoutListsExportFileResponse', () => {
  it('should has ApiProperty decorator for all properties on root Dto', () => {
    const dto = {
      formatVersion: WORKOUT_LISTS_EXPORT_FORMAT_VERSION,
      app: WORKOUT_LISTS_EXPORT_APP,
      exportedAt: '2026-06-03T12:00:00.000Z',
      workoutLists: [
        {
          name: 'Push Day',
          description: 'Chest',
          exercises: [{ name: 'Bench', muscleGroup: 'chest' as const, weight: 60, reps: 10, sets: 3 }],
        },
      ],
    } as WorkoutListsExportFileResponse.Dto;
    checkForApiProperties(dto, WorkoutListsExportFileResponse.Dto);
  });
});
