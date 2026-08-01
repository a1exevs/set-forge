import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

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

const getCachedSession = (
  qc: ReturnType<typeof useQueryClient>,
  workoutListId: string,
): WorkoutSession | null | undefined =>
  qc.getQueryData<WorkoutSession>(workoutSessionQueryKeys.forList(workoutListId)) ??
  qc.getQueryData<WorkoutSession | null>(workoutSessionQueryKeys.active(workoutListId));

/** Keep optimistic (or later) progress when a slower PATCH response would rewind the UI. */
const mergeSessionProgress = (current: WorkoutSession, incoming: WorkoutSession): WorkoutSession => ({
  ...incoming,
  status: incoming.status === 'completed' || current.status === 'completed' ? 'completed' : incoming.status,
  finishedAt: incoming.finishedAt ?? current.finishedAt,
  exercises: incoming.exercises.map(incomingExercise => {
    const currentExercise = current.exercises.find(exercise => exercise.id === incomingExercise.id);
    if (!currentExercise) {
      return incomingExercise;
    }
    return {
      ...incomingExercise,
      completedSets: Math.max(currentExercise.completedSets, incomingExercise.completedSets),
    };
  }),
});

const hasProgressBeyond = (current: WorkoutSession, baseline: WorkoutSession): boolean =>
  current.status === 'completed' ||
  current.exercises.some(exercise => {
    const base = baseline.exercises.find(item => item.id === exercise.id);
    return base != null && exercise.completedSets > base.completedSets;
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
  // Serialize PATCHes so the server does not lose increments under rapid taps / slow network.
  const queueRef = useRef(Promise.resolve(undefined));

  return useMutation({
    mutationFn: ({ sessionId, exerciseId, workoutListId }: IncrementProgressVars) => {
      const run = async (): Promise<WorkoutSession> => {
        const cached = getCachedSession(qc, workoutListId);
        // Skip once the session is already completed (extra rapid taps / auto-finish).
        // Do not gate on completedSets — onMutate may already have raced ahead of this PATCH.
        if (cached?.status === 'completed') {
          return cached;
        }
        return incrementSessionProgress(sessionId, exerciseId);
      };

      const queued = queueRef.current.then(run, run);
      queueRef.current = queued.then(
        () => undefined,
        () => undefined,
      );
      return queued;
    },
    onMutate: async ({ workoutListId, exerciseId }) => {
      await qc.cancelQueries({ queryKey: workoutSessionQueryKeys.active(workoutListId) });

      const previous = getCachedSession(qc, workoutListId) ?? undefined;

      if (previous) {
        syncSessionCaches(qc, workoutListId, applyProgressIncrement(previous, exerciseId));
      }

      return { previous };
    },
    onSuccess: (updated, { workoutListId }) => {
      const current = getCachedSession(qc, workoutListId);
      syncSessionCaches(qc, workoutListId, current ? mergeSessionProgress(current, updated) : updated);
      if (updated.status === 'completed') {
        void qc.invalidateQueries({ queryKey: workoutSessionQueryKeys.historyRoot });
      }
    },
    onError: (_error, { workoutListId }, context) => {
      const cached = getCachedSession(qc, workoutListId);
      // Another path (e.g. entry finish) may have completed the session; do not undo that UI.
      if (cached?.status === 'completed') {
        return;
      }
      // Later optimistic taps may have moved past this mutation's baseline — do not rewind them.
      if (cached && context?.previous && hasProgressBeyond(cached, context.previous)) {
        return;
      }
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
      void qc.invalidateQueries({ queryKey: workoutSessionQueryKeys.historyRoot });
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
