import { WorkoutListResponse } from '@workout-lists/dto/workout-list.response';
import { checkForApiProperties } from '@test/unit/helpers';

describe('WorkoutListResponse', () => {
  it('should has ApiProperty decorator for all properties', () => {
    const dto = new WorkoutListResponse.Dto({
      id: 'list-1',
      name: 'Push Day',
      description: 'Chest',
      exercises: [{ id: 'ex-1', name: 'Bench', muscleGroup: 'chest', weight: 60, reps: 10, sets: 3 }],
      createdAt: '2026-06-03T12:00:00.000Z',
      lastUsedAt: null,
    });
    checkForApiProperties(dto, WorkoutListResponse.Dto);
  });
});
