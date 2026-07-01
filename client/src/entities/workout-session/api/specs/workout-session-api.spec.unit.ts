import { apiRequest, ApiRequestError } from '@shared';

import {
  fetchActiveWorkoutSession,
  fetchWorkoutHistory,
  fetchWorkoutSession,
  finishWorkoutSession,
  incrementSessionProgress,
  resyncWorkoutSession,
  startWorkoutSession,
} from 'src/entities/workout-session/api/workout-session-api';

jest.mock('src/shared/api/http-client', () => {
  const actual = jest.requireActual('src/shared/api/http-client');
  return { ...actual, apiRequest: jest.fn() };
});

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

const okEnvelope = <T>(data: T) => ({ data, messages: [], fieldsErrors: [], resultCode: 0 });

const SESSION = {
  id: 'session-1',
  workoutListId: 'list-1',
  workoutListName: 'Push Day',
  status: 'active' as const,
  startedAt: '2026-06-03T12:00:00.000Z',
  finishedAt: null,
  exercises: [
    {
      id: 'sx-1',
      sourceExerciseId: 'ex-1',
      name: 'Bench',
      muscleGroup: 'chest' as const,
      weight: 60,
      reps: 10,
      sets: 3,
      completedSets: 0,
    },
  ],
};

describe('workout-session-api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('startWorkoutSession posts the workoutListId and returns the session', async () => {
    mockedApiRequest.mockResolvedValue(okEnvelope(SESSION));

    const result = await startWorkoutSession('list-1');

    expect(mockedApiRequest).toHaveBeenCalledWith('/workout-sessions', {
      method: 'POST',
      auth: true,
      body: { workoutListId: 'list-1' },
    });
    expect(result).toEqual(SESSION);
  });

  it('fetchActiveWorkoutSession requests the active endpoint with the list query', async () => {
    mockedApiRequest.mockResolvedValue(okEnvelope(SESSION));

    const result = await fetchActiveWorkoutSession('list-1');

    expect(mockedApiRequest).toHaveBeenCalledWith('/workout-sessions/active?workoutListId=list-1', {
      method: 'GET',
      auth: true,
    });
    expect(result).toEqual(SESSION);
  });

  it('fetchActiveWorkoutSession returns null on a 404 ApiRequestError', async () => {
    mockedApiRequest.mockRejectedValue(
      new ApiRequestError(404, { data: null, messages: ['Not found'], fieldsErrors: [], resultCode: 1 }),
    );

    const result = await fetchActiveWorkoutSession('missing');

    expect(result).toBeNull();
  });

  it('fetchWorkoutSession returns the session on success', async () => {
    mockedApiRequest.mockResolvedValue(okEnvelope(SESSION));

    const result = await fetchWorkoutSession('session-1');

    expect(mockedApiRequest).toHaveBeenCalledWith('/workout-sessions/session-1', { method: 'GET', auth: true });
    expect(result).toEqual(SESSION);
  });

  it('fetchWorkoutSession returns null on a 404 ApiRequestError', async () => {
    mockedApiRequest.mockRejectedValue(
      new ApiRequestError(404, { data: null, messages: ['Not found'], fieldsErrors: [], resultCode: 1 }),
    );

    const result = await fetchWorkoutSession('missing');

    expect(result).toBeNull();
  });

  it('incrementSessionProgress patches the session exercise progress endpoint', async () => {
    mockedApiRequest.mockResolvedValue(okEnvelope(SESSION));

    await incrementSessionProgress('session-1', 'sx-1');

    expect(mockedApiRequest).toHaveBeenCalledWith('/workout-sessions/session-1/exercises/sx-1/progress', {
      method: 'PATCH',
      auth: true,
    });
  });

  it('finishWorkoutSession posts to the finish endpoint', async () => {
    mockedApiRequest.mockResolvedValue(okEnvelope({ ...SESSION, status: 'completed' }));

    await finishWorkoutSession('session-1');

    expect(mockedApiRequest).toHaveBeenCalledWith('/workout-sessions/session-1/finish', { method: 'POST', auth: true });
  });

  it('resyncWorkoutSession posts to the resync endpoint', async () => {
    mockedApiRequest.mockResolvedValue(okEnvelope(SESSION));

    await resyncWorkoutSession('session-1');

    expect(mockedApiRequest).toHaveBeenCalledWith('/workout-sessions/session-1/resync', { method: 'POST', auth: true });
  });

  it('fetchWorkoutHistory requests the paginated history endpoint and returns the page', async () => {
    const page = { items: [{ ...SESSION, status: 'completed' as const }], total: 1, hasMore: false };
    mockedApiRequest.mockResolvedValue(okEnvelope(page));

    const result = await fetchWorkoutHistory(20, 40);

    expect(mockedApiRequest).toHaveBeenCalledWith('/workout-sessions?limit=20&offset=40', {
      method: 'GET',
      auth: true,
    });
    expect(result).toEqual(page);
  });

  it('throws when the envelope resultCode is not OK', async () => {
    mockedApiRequest.mockResolvedValue({ data: null, messages: ['boom'], fieldsErrors: [], resultCode: 1 });

    await expect(startWorkoutSession('list-1')).rejects.toThrow('boom');
  });
});
