import type { UpdateWorkoutListDto, WorkoutList } from '@entities';
import { useNavigate } from '@tanstack/react-router';
import { FC } from 'react';

import { NotFoundMessage, WorkoutListForm } from '@widgets';

type Props = {
  id: string;
  workout: WorkoutList | null | undefined;
  updateWorkoutList: (id: string, dto: UpdateWorkoutListDto) => Promise<boolean>;
};

const EditWorkoutPageLogicLayer: FC<Props> = ({ id, workout, updateWorkoutList }) => {
  const navigate = useNavigate();

  if (workout === undefined) {
    return null;
  }

  if (workout === null) {
    return <NotFoundMessage title="Workout list not found" />;
  }

  return (
    <WorkoutListForm
      mode="edit"
      initialData={workout}
      onSubmit={(dto): void => {
        void (async (): Promise<void> => {
          const success = await updateWorkoutList(id, dto);
          if (!success) {
            // TODO: Support common toaster
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

export default EditWorkoutPageLogicLayer;
