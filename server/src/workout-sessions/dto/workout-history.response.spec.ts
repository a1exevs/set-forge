import { checkForApiProperties } from '@test/unit/helpers';
import { SESSION_STATUS } from '@workout-sessions/constants/session-status';
import { WorkoutHistoryResponse } from '@workout-sessions/dto/workout-history.response';
import { WorkoutSessionResponse } from '@workout-sessions/dto/workout-session.response';

describe('WorkoutHistoryResponse', () => {
  it('should has ApiProperty decorator for all properties', () => {
    const session = new WorkoutSessionResponse.Dto({
      id: 'session-1',
      workoutListId: 'list-1',
      workoutListName: 'Push Day',
      status: SESSION_STATUS.COMPLETED,
      startedAt: '2026-06-03T12:00:00.000Z',
      finishedAt: '2026-06-03T13:00:00.000Z',
      exercises: [],
    });
    const dto = new WorkoutHistoryResponse.Dto({ items: [session], total: 1, hasMore: false });
    checkForApiProperties(dto, WorkoutHistoryResponse.Dto);
  });
});
