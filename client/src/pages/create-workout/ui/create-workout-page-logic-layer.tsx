import { useNavigate } from '@tanstack/react-router';
import { FC } from 'react';

import type { CreateWorkoutListDto } from '@entities/workout-list';
import { toastError, toastSuccess, useProgress } from '@shared/lib';
import { WorkoutListForm } from '@widgets/workout-list-form';

type Props = {
  onCreate: (dto: CreateWorkoutListDto) => Promise<void>;
};

const CreateWorkoutPageLogicLayer: FC<Props> = ({ onCreate }) => {
  const navigate = useNavigate();
  const { run, progressOf } = useProgress<'save'>();

  const onSubmit = async (dto: CreateWorkoutListDto): Promise<void> => {
    try {
      if (await run('save', () => onCreate(dto))) {
        toastSuccess('Workout list created');
        navigate({ to: '/' });
      }
    } catch (error: unknown) {
      toastError(error, 'Failed to create workout list');
    }
  };

  return (
    <WorkoutListForm
      mode="create"
      submitProgress={progressOf('save')}
      onSubmit={(dto: CreateWorkoutListDto): void => void onSubmit(dto)}
      onCancel={(): void => {
        navigate({ to: '/' });
      }}
    />
  );
};

export default CreateWorkoutPageLogicLayer;
