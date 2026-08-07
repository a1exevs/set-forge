import { validateDto } from '@test/unit/helpers';
import { GetActiveWorkoutSessionQuery } from '@workout-sessions/dto/get-active-workout-session.query';

describe('GetActiveWorkoutSessionQuery.Dto', () => {
  it('accepts a valid workoutListId', async () => {
    const errors = await validateDto(GetActiveWorkoutSessionQuery.Dto, {
      workoutListId: 'a3f1c0e2-0000-4000-8000-000000000001',
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing workoutListId', async () => {
    const errors = await validateDto(GetActiveWorkoutSessionQuery.Dto, {} as GetActiveWorkoutSessionQuery.Dto);
    expect(errors.some(error => error.property === 'workoutListId')).toBe(true);
  });

  it('rejects a non-uuid workoutListId', async () => {
    const errors = await validateDto(GetActiveWorkoutSessionQuery.Dto, { workoutListId: 'not-a-uuid' });
    expect(errors.some(error => error.property === 'workoutListId')).toBe(true);
  });
});
