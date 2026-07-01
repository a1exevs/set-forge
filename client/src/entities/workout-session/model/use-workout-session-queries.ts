import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchActiveWorkoutSession,
  fetchWorkoutHistory,
  finishWorkoutSession,
  incrementSessionProgress,
  resyncWorkoutSession,
  startWorkoutSession,
} from 'src/entities/workout-session/api';
import type { WorkoutSession } from 'src/entities/workout-session/model/types';
import { workoutSessionQueryKeys } from 'src/entities/workout-session/model/workout-session-query-keys';

const HISTORY_PAGE_SIZE = 20;

const applyProgressIncrement = (session: WorkoutSession, exerciseId: string): WorkoutSession => ({
  ...session,
  exercises: session.exercises.map(exercise => {
    if (exercise.id !== exerciseId || exercise.completedSets >= exercise.sets) {
      return exercise;
    }
    return { ...exercise, completedSets: exercise.completedSets + 1 };
  }),
});

/** Start or resume the active session for a workout list when entering workout mode. */
export function useWorkoutSessionForListQuery(workoutListId: string, enabled = true) {
  return useQuery<WorkoutSession>({
    queryKey: workoutSessionQueryKeys.forList(workoutListId),
    queryFn: () => startWorkoutSession(workoutListId),
    enabled: enabled && workoutListId.length > 0,
    // Entering workout mode must always re-issue `start` (idempotent resume while the session is
    // active, a brand-new session once the previous one is completed). The cache is kept only for
    // the lifetime of the page so a finished session is never re-served on the next entry; `start`
    // re-runs on every mount. Window-focus/reconnect refetches stay off so sessions are never
    // spawned silently in the background.
    gcTime: 0,
    staleTime: Infinity,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
}

export function useActiveWorkoutSessionQuery(workoutListId: string, enabled = true) {
  return useQuery<WorkoutSession | null>({
    queryKey: workoutSessionQueryKeys.active(workoutListId),
    queryFn: () => fetchActiveWorkoutSession(workoutListId),
    enabled: enabled && workoutListId.length > 0,
  });
}

/** Infinite (offset-based) history of completed sessions, newest first. */
export function useWorkoutHistoryInfiniteQuery(enabled = true) {
  return useInfiniteQuery({
    queryKey: workoutSessionQueryKeys.history(HISTORY_PAGE_SIZE),
    queryFn: ({ pageParam }) => fetchWorkoutHistory(HISTORY_PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.reduce((count, page) => count + page.items.length, 0) : undefined,
    enabled,
  });
}

type IncrementProgressVars = { sessionId: string; workoutListId: string; exerciseId: string };

export function useIncrementSessionProgressMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, exerciseId }: IncrementProgressVars) => incrementSessionProgress(sessionId, exerciseId),
    onMutate: async ({ workoutListId, exerciseId }) => {
      await qc.cancelQueries({ queryKey: workoutSessionQueryKeys.forList(workoutListId) });

      const previous = qc.getQueryData<WorkoutSession>(workoutSessionQueryKeys.forList(workoutListId));
      if (previous) {
        qc.setQueryData(workoutSessionQueryKeys.forList(workoutListId), applyProgressIncrement(previous, exerciseId));
      }

      return { previous };
    },
    onSuccess: (updated, { workoutListId }) => {
      qc.setQueryData(workoutSessionQueryKeys.forList(workoutListId), updated);
      qc.setQueryData(workoutSessionQueryKeys.detail(updated.id), updated);
    },
    onError: (_error, { workoutListId }, context) => {
      if (context?.previous) {
        qc.setQueryData(workoutSessionQueryKeys.forList(workoutListId), context.previous);
      }
    },
  });
}

type FinishSessionVars = { sessionId: string; workoutListId: string };

export function useFinishWorkoutSessionMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId }: FinishSessionVars) => finishWorkoutSession(sessionId),
    onSuccess: (updated, { workoutListId }) => {
      qc.setQueryData(workoutSessionQueryKeys.forList(workoutListId), updated);
      qc.setQueryData(workoutSessionQueryKeys.detail(updated.id), updated);
      void qc.invalidateQueries({ queryKey: workoutSessionQueryKeys.active(workoutListId) });
      void qc.invalidateQueries({ queryKey: ['workout-sessions', 'history'] });
    },
  });
}

type ResyncSessionVars = { sessionId: string; workoutListId: string };

export function useResyncWorkoutSessionMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId }: ResyncSessionVars) => resyncWorkoutSession(sessionId),
    onSuccess: (updated, { workoutListId }) => {
      qc.setQueryData(workoutSessionQueryKeys.forList(workoutListId), updated);
      qc.setQueryData(workoutSessionQueryKeys.detail(updated.id), updated);
      void qc.invalidateQueries({ queryKey: workoutSessionQueryKeys.active(workoutListId) });
    },
  });
}
