import { FC } from 'react';

import { useUpdateWorkoutListMutation, useWorkoutQuery } from '@entities';

import EditWorkoutPageLogicLayer from 'src/pages/edit-workout/ui/edit-workout-page-logic-layer';

type Props = {
  id: string;
};

const EditWorkoutPageDataLayer: FC<Props> = ({ id }) => {
  const { data: workout, isLoading } = useWorkoutQuery(id);
  const updateWorkoutListMutation = useUpdateWorkoutListMutation();

  return (
    <EditWorkoutPageLogicLayer
      id={id}
      workout={isLoading ? undefined : (workout ?? null)}
      updateWorkoutList={async (workoutId, dto): Promise<boolean> => {
        try {
          await updateWorkoutListMutation.mutateAsync({ id: workoutId, dto });
          return true;
        } catch {
          // TODO: Support common toaster
          return false;
        }
      }}
    />
  );
};

export default EditWorkoutPageDataLayer;
