import { FC } from 'react';

import {
  useActiveWorkoutSessionQuery,
  useResyncWorkoutSessionMutation,
  useUpdateWorkoutListMutation,
  useWorkoutQuery,
} from '@entities';

import EditWorkoutPageLogicLayer from 'src/pages/edit-workout/ui/edit-workout-page-logic-layer';

type Props = {
  id: string;
};

const EditWorkoutPageDataLayer: FC<Props> = ({ id }) => {
  const { data: workout, isLoading } = useWorkoutQuery(id);
  const { data: activeSession } = useActiveWorkoutSessionQuery(id);
  const updateWorkoutListMutation = useUpdateWorkoutListMutation();
  const resyncWorkoutSessionMutation = useResyncWorkoutSessionMutation();

  // TODO: Distinguish query errors (network, server) from a missing list — not only "Workout list not found"
  return (
    <EditWorkoutPageLogicLayer
      id={id}
      workout={isLoading ? undefined : (workout ?? null)}
      activeSessionId={activeSession?.id ?? null}
      updateWorkoutList={async (workoutId, dto): Promise<void> => {
        await updateWorkoutListMutation.mutateAsync({ id: workoutId, dto });
      }}
      resyncSession={async (sessionId): Promise<void> => {
        await resyncWorkoutSessionMutation.mutateAsync({ sessionId, workoutListId: id });
      }}
    />
  );
};

export default EditWorkoutPageDataLayer;
