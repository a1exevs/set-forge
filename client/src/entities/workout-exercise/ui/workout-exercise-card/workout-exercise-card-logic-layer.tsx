import { FC } from 'react';

import { useT } from '@shared/lib';

import WorkoutExerciseCard from './workout-exercise-card';
import type { WorkoutExercise } from '../../model/workout-exercise';

type Props = {
  exercise: WorkoutExercise;
};

const WorkoutExerciseCardLogicLayer: FC<Props> = ({ exercise }) => {
  const { t, language } = useT();

  return <WorkoutExerciseCard exercise={exercise} t={t} language={language} />;
};

export default WorkoutExerciseCardLogicLayer;
