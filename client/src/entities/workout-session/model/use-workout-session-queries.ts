import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  discardWorkoutSession,
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

const syncSessionCaches = (
  qc: ReturnType<typeof useQueryClient>,
  workoutListId: string,
  session: WorkoutSession,
): void => {
  qc.setQueryData(workoutSessionQueryKeys.forList(workoutListId), session);
  qc.setQueryData(workoutSessionQueryKeys.active(workoutListId), session.status === 'active' ? session : null);
  qc.setQueryData(workoutSessionQueryKeys.detail(session.id), session);
};

export function useIncrementSessionProgressMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, exerciseId }: IncrementProgressVars) => incrementSessionProgress(sessionId, exerciseId),
    onMutate: async ({ workoutListId, exerciseId }) => {
      await qc.cancelQueries({ queryKey: workoutSessionQueryKeys.active(workoutListId) });

      const previous =
        qc.getQueryData<WorkoutSession>(workoutSessionQueryKeys.forList(workoutListId)) ??
        qc.getQueryData<WorkoutSession | null>(workoutSessionQueryKeys.active(workoutListId)) ??
        undefined;

      if (previous) {
        syncSessionCaches(qc, workoutListId, applyProgressIncrement(previous, exerciseId));
      }

      return { previous };
    },
    onSuccess: (updated, { workoutListId }) => {
      syncSessionCaches(qc, workoutListId, updated);
    },
    onError: (_error, { workoutListId }, context) => {
      if (context?.previous) {
        syncSessionCaches(qc, workoutListId, context.previous);
      }
    },
  });
}

type FinishSessionVars = { sessionId: string; workoutListId: string };

export function useStartWorkoutSessionMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (workoutListId: string) => startWorkoutSession(workoutListId),
    onSuccess: (updated, workoutListId) => {
      syncSessionCaches(qc, workoutListId, updated);
    },
  });
}

export function useFinishWorkoutSessionMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId }: FinishSessionVars) => finishWorkoutSession(sessionId),
    onSuccess: (updated, { workoutListId }) => {
      syncSessionCaches(qc, workoutListId, updated);
      void qc.invalidateQueries({ queryKey: ['workout-sessions', 'history'] });
    },
  });
}

type ResyncSessionVars = { sessionId: string; workoutListId: string };

export function useDiscardWorkoutSessionMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId }: FinishSessionVars) => discardWorkoutSession(sessionId),
    onSuccess: (_data, { workoutListId }) => {
      qc.removeQueries({ queryKey: workoutSessionQueryKeys.forList(workoutListId) });
      qc.setQueryData(workoutSessionQueryKeys.active(workoutListId), null);
    },
  });
}

export function useResyncWorkoutSessionMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId }: ResyncSessionVars) => resyncWorkoutSession(sessionId),
    onSuccess: (updated, { workoutListId }) => {
      syncSessionCaches(qc, workoutListId, updated);
    },
  });
}
