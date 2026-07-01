import { ImportWorkoutListsResponse } from '@workout-lists/dto/import-workout-lists.response';
import { WorkoutListResponse } from '@workout-lists/dto/workout-list.response';
import { checkForApiProperties } from '@test/unit/helpers';

describe('ImportWorkoutListsResponse', () => {
  it('should has ApiProperty decorator for all properties', () => {
    const list = new WorkoutListResponse.Dto({
      id: 'list-1',
      name: 'Push Day',
      description: '',
      exercises: [],
      createdAt: '2026-06-03T12:00:00.000Z',
      lastUsedAt: null,
    });
    const dto = new ImportWorkoutListsResponse.Dto({ importedCount: 1, lists: [list] });
    checkForApiProperties(dto, ImportWorkoutListsResponse.Dto);
  });
});
