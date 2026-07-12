import { WorkoutSessionResponse } from '@workout-sessions/dto/workout-session.response';
import { SESSION_STATUS } from '@workout-sessions/constants/session-status';
import { checkForApiProperties } from '@test/unit/helpers';

describe('WorkoutSessionResponse', () => {
  it('should has ApiProperty decorator for all properties', () => {
    const dto = new WorkoutSessionResponse.Dto({
      id: 'session-1',
      workoutListId: 'list-1',
      workoutListName: 'Push Day',
      status: SESSION_STATUS.ACTIVE,
      startedAt: '2026-06-03T12:00:00.000Z',
      finishedAt: null,
      exercises: [
        {
          id: 'ex-1',
          sourceExerciseId: 'src-1',
          name: 'Bench',
          muscleGroup: 'chest',
          weight: 60,
          reps: 10,
          sets: 3,
          completedSets: 0,
        },
      ],
    });
    checkForApiProperties(dto, WorkoutSessionResponse.Dto);
  });
});
