import { FC } from 'react';

import { useWorkoutListStore } from '@entities';

import EditWorkoutPageLogicLayer from 'src/pages/edit-workout/ui/edit-workout-page-logic-layer';

type Props = {
  id: string;
};

const EditWorkoutPageDataLayer: FC<Props> = ({ id }) => {
  const currentWorkout = useWorkoutListStore.use.currentWorkout();
  const setCurrentWorkout = useWorkoutListStore.use.setCurrentWorkout();
  const clearCurrentWorkout = useWorkoutListStore.use.clearCurrentWorkout();
  const updateWorkoutList = useWorkoutListStore.use.updateWorkoutList();

  return (
    <EditWorkoutPageLogicLayer
      id={id}
      currentWorkout={currentWorkout}
      setCurrentWorkout={setCurrentWorkout}
      clearCurrentWorkout={clearCurrentWorkout}
      updateWorkoutList={updateWorkoutList}
    />
  );
};

export default EditWorkoutPageDataLayer;
