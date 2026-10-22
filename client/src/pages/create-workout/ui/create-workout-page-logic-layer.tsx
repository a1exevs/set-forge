import { useNavigate } from '@tanstack/react-router';
import { FC, useState } from 'react';

import type { CreateWorkoutListDto } from '@entities/workout-list';
import { toastError, toastSuccess, useProgress, useT } from '@shared/lib';
import { formServerErrors, WorkoutListForm } from '@widgets/workout-list-form';

type Props = {
  onCreate: (dto: CreateWorkoutListDto) => Promise<void>;
};

const CreateWorkoutPageLogicLayer: FC<Props> = ({ onCreate }) => {
  const navigate = useNavigate();
  const { run, progressOf } = useProgress<'save'>();
  const { t } = useT();
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>();

  const onSubmit = async (dto: CreateWorkoutListDto): Promise<void> => {
    try {
      if (await run('save', () => onCreate(dto))) {
        toastSuccess(t('workoutList.toasts.created'));
        navigate({ to: '/' });
      }
    } catch (error: unknown) {
      // The form shows what it has a field for; the rest, or a failure without errors, goes to the toast.
      const { fields, others } = formServerErrors(error, t);
      setServerFieldErrors(fields);
      if (others.length > 0) {
        toastError(others.join(' '));
      } else if (Object.keys(fields).length === 0) {
        toastError(t('workoutList.toasts.createFailed'));
      }
    }
  };

  return (
    <WorkoutListForm
      mode="create"
      submitProgress={progressOf('save')}
      serverFieldErrors={serverFieldErrors}
      onSubmit={(dto: CreateWorkoutListDto): void => void onSubmit(dto)}
      onCancel={(): void => {
        navigate({ to: '/' });
      }}
    />
  );
};

export default CreateWorkoutPageLogicLayer;
