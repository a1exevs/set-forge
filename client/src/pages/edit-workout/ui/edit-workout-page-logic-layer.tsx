import type { UpdateWorkoutListDto, WorkoutList } from '@entities';
import { useNavigate } from '@tanstack/react-router';
import { FC, useEffect } from 'react';

import { NotFoundMessage, WorkoutListForm } from '@widgets';

type Props = {
  id: string;
  currentWorkout: WorkoutList | null;
  setCurrentWorkout: (id: string) => void;
  clearCurrentWorkout: () => void;
  updateWorkoutList: (id: string, dto: UpdateWorkoutListDto) => boolean;
};

const EditWorkoutPageLogicLayer: FC<Props> = ({
  id,
  currentWorkout,
  setCurrentWorkout,
  clearCurrentWorkout,
  updateWorkoutList,
}) => {
  const navigate = useNavigate();

  useEffect((): (() => void) => {
    if (id) {
      setCurrentWorkout(id);
    }
    return clearCurrentWorkout;
  }, [id, setCurrentWorkout, clearCurrentWorkout]);

  if (currentWorkout === null) {
    return <NotFoundMessage title="Workout list not found" />;
  }

  return (
    <WorkoutListForm
      mode="edit"
      initialData={currentWorkout}
      onSubmit={(dto): void => {
        const success = updateWorkoutList(id, dto);
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

export default EditWorkoutPageLogicLayer;
