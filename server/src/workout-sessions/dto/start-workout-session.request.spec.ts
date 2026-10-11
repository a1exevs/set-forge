import { validateDto } from '@test/unit/helpers';
import { StartWorkoutSessionRequest } from '@workout-sessions/dto/start-workout-session.request';

describe('StartWorkoutSessionRequest.Dto', () => {
  it('accepts a valid workout list id', async () => {
    const errors = await validateDto(StartWorkoutSessionRequest.Dto, {
      workoutListId: 'a3f1c0e2-8b4d-4e1f-9c2a-1b2c3d4e5f6a',
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects a non-uuid workout list id', async () => {
    const errors = await validateDto(StartWorkoutSessionRequest.Dto, {
      workoutListId: 'not-a-uuid',
    });
    expect(errors.some(error => error.property === 'workoutListId')).toBe(true);
  });
});
