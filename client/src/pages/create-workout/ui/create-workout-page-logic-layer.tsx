import type { CreateWorkoutListDto } from '@entities';
import { useNavigate } from '@tanstack/react-router';
import { FC } from 'react';

import { toastError, toastSuccess } from '@shared';
import { WorkoutListForm } from '@widgets';

type Props = {
  onCreate: (dto: CreateWorkoutListDto) => Promise<void>;
};

const CreateWorkoutPageLogicLayer: FC<Props> = ({ onCreate }) => {
  const navigate = useNavigate();

  const onSubmit = async (dto: CreateWorkoutListDto): Promise<void> => {
    try {
      await onCreate(dto);
      toastSuccess('Workout list created');
      navigate({ to: '/' });
    } catch (error: unknown) {
      toastError(error, 'Failed to create workout list');
    }
  };

  return (
    <WorkoutListForm
      mode="create"
      onSubmit={onSubmit}
      onCancel={(): void => {
        navigate({ to: '/' });
      }}
    />
  );
};

export default CreateWorkoutPageLogicLayer;
