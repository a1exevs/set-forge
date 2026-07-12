import { validateDto } from '@test/unit/helpers';

import { UpdateWorkoutListRequest } from '@workout-lists/dto/update-workout-list.request';

describe('UpdateWorkoutListRequest.Dto', () => {
  const validExercise = {
    id: 'b7e2d1f4-0000-4000-8000-000000000001',
    name: 'Bench Press',
    muscleGroup: 'chest' as const,
    weight: 60,
    reps: 10,
    sets: 3,
  };

  it('accepts a list with at least one exercise', async () => {
    const errors = await validateDto(UpdateWorkoutListRequest.Dto, {
      name: 'Push Day',
      description: 'Chest',
      exercises: [validExercise],
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects an empty exercises array', async () => {
    const errors = await validateDto(UpdateWorkoutListRequest.Dto, {
      name: 'Push Day',
      description: 'Chest',
      exercises: [],
    });
    expect(errors.some(error => error.property === 'exercises')).toBe(true);
  });
});
