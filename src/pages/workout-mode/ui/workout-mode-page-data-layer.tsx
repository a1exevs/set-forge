import { FC } from 'react';

import { useWorkoutListStore } from '@entities';

import WorkoutModePageLogicLayer from 'src/pages/workout-mode/ui/workout-mode-page-logic-layer';

type Props = {
  id: string;
};

const WorkoutModePageDataLayer: FC<Props> = ({ id }) => {
  const currentWorkout = useWorkoutListStore.use.currentWorkout();
  const setCurrentWorkout = useWorkoutListStore.use.setCurrentWorkout();
  const clearCurrentWorkout = useWorkoutListStore.use.clearCurrentWorkout();
  const updateWorkoutProgress = useWorkoutListStore.use.updateWorkoutProgress();
  const resetAllProgress = useWorkoutListStore.use.resetAllProgress();

  return (
    <WorkoutModePageLogicLayer
      id={id}
      currentWorkout={currentWorkout}
      setCurrentWorkout={setCurrentWorkout}
      clearCurrentWorkout={clearCurrentWorkout}
      updateWorkoutProgress={updateWorkoutProgress}
      resetAllProgress={resetAllProgress}
    />
  );
};

export default WorkoutModePageDataLayer;
