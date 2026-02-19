import { FC } from 'react';
import HomePage from 'src/pages/home/ui/home-page';
import type { Exercise } from '@entities';

type Props = {
  exercises: Exercise[];
  onRemoveExercise: (id: string) => void;
};

const HomePageLogicLayer: FC<Props> = ({ exercises, onRemoveExercise }) => {
  return (
    <HomePage 
      exercises={exercises}
      onRemoveExercise={onRemoveExercise}
    />
  );
};

export default HomePageLogicLayer;
