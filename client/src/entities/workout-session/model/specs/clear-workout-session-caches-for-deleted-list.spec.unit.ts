import { QueryClient } from '@tanstack/react-query';

import { clearWorkoutSessionCachesForDeletedList } from 'src/entities/workout-session/model/clear-workout-session-caches-for-deleted-list';
import type { WorkoutSession } from 'src/entities/workout-session/model/types';
import { workoutSessionQueryKeys } from 'src/entities/workout-session/model/workout-session-query-keys';

const ACTIVE_SESSION: WorkoutSession = {
  id: 'sess-1',
  workoutListId: 'list-1',
  workoutListName: 'Push Day',
  status: 'active',
  startedAt: '2026-06-03T12:00:00.000Z',
  finishedAt: null,
  exercises: [],
};

describe('clearWorkoutSessionCachesForDeletedList', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  it('clears active, forList, and detail caches for the deleted list', () => {
    queryClient.setQueryData(workoutSessionQueryKeys.active('list-1'), ACTIVE_SESSION);
    queryClient.setQueryData(workoutSessionQueryKeys.forList('list-1'), ACTIVE_SESSION);
    queryClient.setQueryData(workoutSessionQueryKeys.detail('sess-1'), ACTIVE_SESSION);

    clearWorkoutSessionCachesForDeletedList(queryClient, 'list-1');

    expect(queryClient.getQueryData(workoutSessionQueryKeys.active('list-1'))).toBeNull();
    expect(queryClient.getQueryData(workoutSessionQueryKeys.forList('list-1'))).toBeUndefined();
    expect(queryClient.getQueryData(workoutSessionQueryKeys.detail('sess-1'))).toBeUndefined();
  });

  it('clears active and forList when there is no cached active session', () => {
    queryClient.setQueryData(workoutSessionQueryKeys.forList('list-1'), ACTIVE_SESSION);

    clearWorkoutSessionCachesForDeletedList(queryClient, 'list-1');

    expect(queryClient.getQueryData(workoutSessionQueryKeys.active('list-1'))).toBeNull();
    expect(queryClient.getQueryData(workoutSessionQueryKeys.forList('list-1'))).toBeUndefined();
  });
});
