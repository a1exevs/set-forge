import type { UpdateWorkoutListDto, WorkoutList } from '@entities';
import { useNavigate } from '@tanstack/react-router';
import { FC, useEffect, useState } from 'react';

import { NotFoundMessage, WorkoutListForm } from '@widgets';

type Props = {
  id: string;
  currentWorkout: WorkoutList | null;
  setCurrentWorkout: (id: string) => Promise<void>;
  clearCurrentWorkout: () => void;
  updateWorkoutList: (id: string, dto: UpdateWorkoutListDto) => Promise<boolean>;
};

const EditWorkoutPageLogicLayer: FC<Props> = ({
  id,
  currentWorkout,
  setCurrentWorkout,
  clearCurrentWorkout,
  updateWorkoutList,
}) => {
  const navigate = useNavigate();
  const [isResolving, setIsResolving] = useState<boolean>(true);

  useEffect((): (() => void) => {
    let active = true;
    setIsResolving(true);
    void (async (): Promise<void> => {
      if (id) {
        await setCurrentWorkout(id);
      }
      if (active) {
        setIsResolving(false);
      }
    })();
    return (): void => {
      active = false;
      clearCurrentWorkout();
    };
  }, [id, setCurrentWorkout, clearCurrentWorkout]);

  if (isResolving) {
    return null;
  }

  if (currentWorkout === null) {
    return <NotFoundMessage title="Workout list not found" />;
  }

  return (
    <WorkoutListForm
      mode="edit"
      initialData={currentWorkout}
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
