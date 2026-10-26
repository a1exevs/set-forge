import { FC, KeyboardEvent } from 'react';

import { cssVars, formatNumber, type Language, type Translate } from '@shared/lib';
import { Transition } from '@shared/ui';

import classes from './workout-session-exercise-card.module.scss';
import type { WorkoutSessionExercise } from '../../model/workout-session-exercise';

type Props = {
  t: Translate;
  language: Language;
  exercise: WorkoutSessionExercise;
  /** The muscle group in the chosen language. */
  muscleGroupText: string;
  justCompleted: boolean;
  isFinished: boolean;
  isCompleted: boolean;
  progress: number;
  onActivate: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
};

const WorkoutSessionExerciseCard: FC<Props> = ({
  t,
  language,
  exercise,
  muscleGroupText,
  justCompleted,
  isFinished,
  isCompleted,
  progress,
  onActivate,
  onKeyDown,
}) => {
  return (
    <div
      className={`${classes.exerciseCard} ${isCompleted ? classes.completed : ''}`}
      role="button"
      tabIndex={0}
      aria-label={t('workoutSession.card.label', {
        name: exercise.name,
        completed: exercise.completedSets,
        count: exercise.sets,
      })}
      onClick={onActivate}
      onKeyDown={onKeyDown}
    >
      <div className={classes.exerciseHeader}>
        <div className={classes.exerciseInfo}>
          <span className={classes.exerciseName}>{exercise.name}</span>
          <span className={classes.muscleBadge}>{muscleGroupText}</span>
        </div>
        <Transition
          show={justCompleted}
          enter={classes.checkEnter}
          enterFrom={classes.checkEnterFrom}
          enterTo={classes.checkEnterTo}
          leave={classes.checkLeave}
          leaveFrom={classes.checkLeaveFrom}
          leaveTo={classes.checkLeaveTo}
        >
          <span className={classes.checkmark}>✓</span>
        </Transition>
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
          <span className={classes.detailValue}>
            {exercise.completedSets} / {exercise.sets}
          </span>
        </div>
      </div>

      <div className={classes.progressBarContainer} aria-hidden="true">
        <div
          className={`${classes.progressBar} ${isCompleted ? classes.progressCompleted : ''}`}
          style={cssVars({ '--progress': `${progress}%` })}
        />
      </div>

      {!isCompleted && !isFinished && <p className={classes.hint}>{t('workoutSession.card.hint')}</p>}
    </div>
  );
};

export default WorkoutSessionExerciseCard;
