import { FC } from 'react';

import classes from './workout-exercise-card.module.scss';
import { muscleGroupLabels } from '../../model/muscle-group-labels';
import type { WorkoutExercise } from '../../model/workout-exercise';

type Props = {
  exercise: WorkoutExercise;
};

const WorkoutExerciseCard: FC<Props> = ({ exercise }) => {
  return (
    <div className={classes.exerciseCard}>
      <div className={classes.exerciseHeader}>
        <div className={classes.exerciseInfo}>
          <h3>{exercise.name}</h3>
          <span className={classes.muscleBadge}>{muscleGroupLabels[exercise.muscleGroup]}</span>
        </div>
      </div>

      <div className={classes.exerciseDetails}>
        <div className={classes.detail}>
          <span className={classes.detailLabel}>Weight</span>
          <span className={classes.detailValue}>{exercise.weight} kg</span>
        </div>
        <div className={classes.detail}>
          <span className={classes.detailLabel}>Reps</span>
          <span className={classes.detailValue}>{exercise.reps}</span>
        </div>
        <div className={classes.detail}>
          <span className={classes.detailLabel}>Sets</span>
          <span className={classes.detailValue}>{exercise.sets}</span>
        </div>
      </div>
    </div>
  );
};

export default WorkoutExerciseCard;
