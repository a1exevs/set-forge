import { FC } from 'react';
import { useExerciseStore } from '@entities';
import HomePageLogicLayer from 'src/pages/home/ui/home-page-logic-layer';

const HomePageDataLayer: FC = () => {
  const exercises = useExerciseStore.use.exercises();
  const removeExercise = useExerciseStore.use.removeExercise();

  return (
    <HomePageLogicLayer 
      exercises={exercises}
      onRemoveExercise={removeExercise}
    />
  );
};

export default HomePageDataLayer;
