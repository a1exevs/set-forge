import { FC } from 'react';

import { formatNumber, type Language, type Translate } from '@shared/lib';

import classes from './workout-exercise-card.module.scss';
import { muscleGroupLabel } from '../../model/muscle-group';
import type { WorkoutExercise } from '../../model/workout-exercise';

type Props = {
  exercise: WorkoutExercise;
  t: Translate;
  language: Language;
};

const WorkoutExerciseCard: FC<Props> = ({ exercise, t, language }) => {
  return (
    <div className={classes.exerciseCard}>
      <div className={classes.exerciseHeader}>
        <div className={classes.exerciseInfo}>
          <h3>{exercise.name}</h3>
          <span className={classes.muscleBadge}>{muscleGroupLabel(exercise.muscleGroup, t)}</span>
        </div>
      </div>

      <div className={classes.exerciseDetails}>
        <div className={classes.detail}>
          <span className={classes.detailLabel}>{t('exercise.weight')}</span>
          <span className={classes.detailValue}>
            {t('exercise.weightValue', { weight: formatNumber(exercise.weight, language) })}
          </span>
        </div>
        <div className={classes.detail}>
          <span className={classes.detailLabel}>{t('exercise.reps')}</span>
          <span className={classes.detailValue}>{exercise.reps}</span>
        </div>
        <div className={classes.detail}>
          <span className={classes.detailLabel}>{t('exercise.sets')}</span>
          <span className={classes.detailValue}>{exercise.sets}</span>
        </div>
      </div>
    </div>
  );
};

export default WorkoutExerciseCard;
