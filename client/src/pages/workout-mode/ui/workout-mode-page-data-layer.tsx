import { FC } from 'react';

import {
  useFinishWorkoutSessionMutation,
  useIncrementSessionProgressMutation,
  useWorkoutSessionForListQuery,
} from '@entities';

import WorkoutModePageLogicLayer from 'src/pages/workout-mode/ui/workout-mode-page-logic-layer';

type Props = {
  id: string;
};

const WorkoutModePageDataLayer: FC<Props> = ({ id }) => {
  const { data: session, isLoading } = useWorkoutSessionForListQuery(id);
  const incrementSessionProgressMutation = useIncrementSessionProgressMutation();
  const finishWorkoutSessionMutation = useFinishWorkoutSessionMutation();

  // TODO: Distinguish query errors (empty list, network) from a missing list — not only "Workout list not found"
  return (
    <WorkoutModePageLogicLayer
      session={isLoading ? undefined : (session ?? null)}
      incrementProgress={async (sessionId, exerciseId): Promise<void> => {
        await incrementSessionProgressMutation.mutateAsync({ sessionId, workoutListId: id, exerciseId });
      }}
      finishSession={async (sessionId): Promise<void> => {
        await finishWorkoutSessionMutation.mutateAsync({ sessionId, workoutListId: id });
      }}
    />
  );
};

export default WorkoutModePageDataLayer;
