import { FC } from 'react';

import { useCreateWorkoutListMutation } from '@entities';

import CreateWorkoutPageLogicLayer from 'src/pages/create-workout/ui/create-workout-page-logic-layer';

const CreateWorkoutPageDataLayer: FC = () => {
  const createWorkoutListMutation = useCreateWorkoutListMutation();

  return (
    <CreateWorkoutPageLogicLayer
      onSubmit={async (dto): Promise<boolean> => {
        try {
          await createWorkoutListMutation.mutateAsync(dto);
          return true;
        } catch {
          // TODO: Support common toaster
          return false;
        }
      }}
    />
  );
};

export default CreateWorkoutPageDataLayer;
