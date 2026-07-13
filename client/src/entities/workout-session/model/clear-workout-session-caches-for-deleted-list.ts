import type { QueryClient } from '@tanstack/react-query';

import type { WorkoutSession } from 'src/entities/workout-session/model/types';
import { workoutSessionQueryKeys } from 'src/entities/workout-session/model/workout-session-query-keys';

export function clearWorkoutSessionCachesForDeletedList(qc: QueryClient, workoutListId: string): void {
  const active = qc.getQueryData<WorkoutSession | null>(workoutSessionQueryKeys.active(workoutListId));
  if (active?.id) {
    qc.removeQueries({ queryKey: workoutSessionQueryKeys.detail(active.id) });
  }
  qc.setQueryData(workoutSessionQueryKeys.active(workoutListId), null);
  qc.removeQueries({ queryKey: workoutSessionQueryKeys.forList(workoutListId) });
}
