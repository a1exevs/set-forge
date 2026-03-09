import { useNavigate } from '@tanstack/react-router';
import { FC } from 'react';

import { useWorkoutListStore } from '@entities';
import { WorkoutListForm } from '@widgets';

const CreateWorkoutPageDataLayer: FC = () => {
  const addWorkoutList = useWorkoutListStore.use.addWorkoutList();
  const navigate = useNavigate();

  return (
    <WorkoutListForm
      mode="create"
      onSubmit={(dto): void => {
        const success = addWorkoutList(dto);
        if (!success) {
          // TODO: Support common toaster
          return;
        }
        navigate({ to: '/' });
      }}
      onCancel={(): void => {
        navigate({ to: '/' });
      }}
    />
  );
};

export default CreateWorkoutPageDataLayer;
