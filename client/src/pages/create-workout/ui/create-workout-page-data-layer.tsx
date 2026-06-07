import { FC } from 'react';

import { useWorkoutListStore } from '@entities';

import CreateWorkoutPageLogicLayer from 'src/pages/create-workout/ui/create-workout-page-logic-layer';

const CreateWorkoutPageDataLayer: FC = () => {
  const addWorkoutList = useWorkoutListStore.use.addWorkoutList();

  return (
    <CreateWorkoutPageLogicLayer
      onSubmit={async (dto): Promise<boolean> => {
        const success = await addWorkoutList(dto);
        if (!success) {
          // TODO: Support common toaster
        }
        return success;
      }}
    />
  );
};

export default CreateWorkoutPageDataLayer;
