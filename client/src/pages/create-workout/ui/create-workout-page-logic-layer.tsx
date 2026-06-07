import type { CreateWorkoutListDto } from '@entities';
import { useNavigate } from '@tanstack/react-router';
import { FC } from 'react';

import { WorkoutListForm } from '@widgets';

type Props = {
  onSubmit: (dto: CreateWorkoutListDto) => Promise<boolean>;
};

const CreateWorkoutPageLogicLayer: FC<Props> = ({ onSubmit }) => {
  const navigate = useNavigate();

  return (
    <WorkoutListForm
      mode="create"
      onSubmit={(dto): void => {
        void (async (): Promise<void> => {
          const success = await onSubmit(dto);
          if (!success) {
            return;
          }
          navigate({ to: '/' });
        })();
      }}
      onCancel={(): void => {
        navigate({ to: '/' });
      }}
    />
  );
};

export default CreateWorkoutPageLogicLayer;
