import { FC, KeyboardEvent } from 'react';

import type { WorkoutSessionExercise } from 'src/entities/workout-session-exercise/model/types';
import WorkoutSessionExerciseCard from 'src/entities/workout-session-exercise/ui/workout-session-exercise-card/workout-session-exercise-card';

type Props = {
  exercise: WorkoutSessionExercise;
  justCompleted: boolean;
  isFinished: boolean;
  onTap: (exerciseId: string) => void;
};

const WorkoutSessionExerciseCardLogicLayer: FC<Props> = ({ exercise, justCompleted, isFinished, onTap }) => {
  const progress = exercise.sets > 0 ? (exercise.completedSets / exercise.sets) * 100 : 0;
  const isCompleted = exercise.sets > 0 && exercise.completedSets === exercise.sets;

  const handleActivate = (): void => {
    onTap(exercise.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleActivate();
    }
  };

  return (
    <WorkoutSessionExerciseCard
      exercise={exercise}
      justCompleted={justCompleted}
      isFinished={isFinished}
      isCompleted={isCompleted}
      progress={progress}
      onActivate={handleActivate}
      onKeyDown={handleKeyDown}
    />
  );
};

export default WorkoutSessionExerciseCardLogicLayer;
