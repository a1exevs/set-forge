import { FC } from 'react';

import { useResetWorkoutProgressMutation, useUpdateWorkoutProgressMutation, useWorkoutQuery } from '@entities';

import WorkoutModePageLogicLayer from 'src/pages/workout-mode/ui/workout-mode-page-logic-layer';

type Props = {
  id: string;
};

const WorkoutModePageDataLayer: FC<Props> = ({ id }) => {
  const { data: workout, isLoading } = useWorkoutQuery(id);
  const updateWorkoutProgressMutation = useUpdateWorkoutProgressMutation();
  const resetWorkoutProgressMutation = useResetWorkoutProgressMutation();

  return (
    <WorkoutModePageLogicLayer
      id={id}
      workout={isLoading ? undefined : (workout ?? null)}
      updateWorkoutProgress={async (listId, exerciseId): Promise<void> => {
        await updateWorkoutProgressMutation.mutateAsync({ listId, exerciseId });
      }}
      resetAllProgress={async (listId): Promise<void> => {
        await resetWorkoutProgressMutation.mutateAsync(listId);
      }}
    />
  );
};

export default WorkoutModePageDataLayer;
