import { FC } from 'react';

import { useWorkoutQuery } from '@entities/workout-list';
import {
  useActiveWorkoutSessionQuery,
  useDiscardWorkoutSessionMutation,
  useFinishWorkoutSessionMutation,
  useIncrementSessionProgressMutation,
  useStartWorkoutSessionMutation,
  type WorkoutSession,
} from '@entities/workout-session';

import WorkoutModePageLogicLayer from './workout-mode-page-logic-layer';

type Props = {
  id: string;
};

const WorkoutModePageDataLayer: FC<Props> = ({ id }) => {
  const { data: workoutList, isLoading: isListLoading } = useWorkoutQuery(id);
  const { data: activeSession, isLoading: isSessionLoading } = useActiveWorkoutSessionQuery(id);
  const startWorkoutSessionMutation = useStartWorkoutSessionMutation();
  const incrementSessionProgressMutation = useIncrementSessionProgressMutation();
  const finishWorkoutSessionMutation = useFinishWorkoutSessionMutation();
  const discardWorkoutSessionMutation = useDiscardWorkoutSessionMutation();

  const isLoading = isListLoading || isSessionLoading;
  // After completion, `active` is null — prefer finish/progress mutation snapshots over start.
  const session =
    activeSession ??
    finishWorkoutSessionMutation.data ??
    incrementSessionProgressMutation.data ??
    startWorkoutSessionMutation.data ??
    null;

  // TODO: Distinguish query errors (empty list, network) from a missing list — not only "Workout list not found"
  return (
    <WorkoutModePageLogicLayer
      workoutList={isLoading ? undefined : (workoutList ?? null)}
      session={session}
      isStarting={startWorkoutSessionMutation.isPending}
      startSession={async (workoutListId: string): Promise<void> => {
        await startWorkoutSessionMutation.mutateAsync(workoutListId);
      }}
      incrementProgress={async (sessionId: string, exerciseId: string): Promise<WorkoutSession> =>
        incrementSessionProgressMutation.mutateAsync({ sessionId, workoutListId: id, exerciseId })
      }
      finishSession={async (sessionId: string): Promise<void> => {
        await finishWorkoutSessionMutation.mutateAsync({ sessionId, workoutListId: id });
      }}
      discardSession={async (sessionId: string): Promise<void> => {
        await discardWorkoutSessionMutation.mutateAsync({ sessionId, workoutListId: id });
        startWorkoutSessionMutation.reset();
        finishWorkoutSessionMutation.reset();
        incrementSessionProgressMutation.reset();
      }}
    />
  );
};

export default WorkoutModePageDataLayer;
