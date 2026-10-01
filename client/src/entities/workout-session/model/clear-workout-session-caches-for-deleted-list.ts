import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { WorkoutSession } from './workout-session';
import { workoutSessionQueryKeys } from './workout-session-query-keys';

export function clearWorkoutSessionCachesForDeletedList(qc: QueryClient, workoutListId: string): void {
  const active = qc.getQueryData<WorkoutSession | null>(workoutSessionQueryKeys.active(workoutListId));
  if (active?.id) {
    qc.removeQueries({ queryKey: workoutSessionQueryKeys.detail(active.id) });
  }
  qc.setQueryData(workoutSessionQueryKeys.active(workoutListId), null);
  qc.removeQueries({ queryKey: workoutSessionQueryKeys.forList(workoutListId) });
}

/** Drops the cached sessions of a deleted workout list (active, detail, per-list history). */
export function useClearWorkoutSessionCachesForDeletedList(): (workoutListId: string) => void {
  const queryClient = useQueryClient();
  return useCallback(
    (workoutListId: string): void => clearWorkoutSessionCachesForDeletedList(queryClient, workoutListId),
    [queryClient],
  );
}
