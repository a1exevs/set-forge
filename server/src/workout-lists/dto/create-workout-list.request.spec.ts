import { validateDto } from '@test/unit/helpers';

import { CreateWorkoutListRequest } from '@workout-lists/dto/create-workout-list.request';

describe('CreateWorkoutListRequest.Dto', () => {
  const validExercise = { name: 'Bench Press', muscleGroup: 'chest' as const, weight: 60, reps: 10, sets: 3 };

  it('accepts a list with at least one exercise', async () => {
    const errors = await validateDto(CreateWorkoutListRequest.Dto, {
      name: 'Push Day',
      description: 'Chest',
      exercises: [validExercise],
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects an empty exercises array', async () => {
    const errors = await validateDto(CreateWorkoutListRequest.Dto, {
      name: 'Push Day',
      description: 'Chest',
      exercises: [],
    });
    expect(errors.some(error => error.property === 'exercises')).toBe(true);
  });
});
