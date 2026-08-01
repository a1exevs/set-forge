import { Transition } from '@headlessui/react';
import { FC, KeyboardEvent } from 'react';

import { muscleGroupLabels } from 'src/entities/workout-exercise/model/muscle-group-labels';
import type { WorkoutSessionExercise } from 'src/entities/workout-session-exercise/model/types';
import classes from 'src/entities/workout-session-exercise/ui/workout-session-exercise-card/workout-session-exercise-card.module.scss';

type Props = {
  exercise: WorkoutSessionExercise;
  justCompleted: boolean;
  isFinished: boolean;
  isCompleted: boolean;
  progress: number;
  onActivate: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
};

const WorkoutSessionExerciseCard: FC<Props> = ({
  exercise,
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
      aria-label={`${exercise.name}: ${exercise.completedSets} of ${exercise.sets} sets`}
      onClick={onActivate}
      onKeyDown={onKeyDown}
    >
      <div className={classes.exerciseHeader}>
        <div className={classes.exerciseInfo}>
          <span className={classes.exerciseName}>{exercise.name}</span>
          <span className={classes.muscleBadge}>{muscleGroupLabels[exercise.muscleGroup]}</span>
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
          <span className={classes.detailLabel}>Weight</span>
          <span className={classes.detailValue}>{exercise.weight} kg</span>
        </div>
        <div className={classes.detail}>
          <span className={classes.detailLabel}>Reps</span>
          <span className={classes.detailValue}>{exercise.reps}</span>
        </div>
        <div className={classes.detail}>
          <span className={classes.detailLabel}>Sets</span>
          <span className={classes.detailValue}>
            {exercise.completedSets} / {exercise.sets}
          </span>
        </div>
      </div>

      <div className={classes.progressBarContainer} aria-hidden="true">
        <div
          className={`${classes.progressBar} ${isCompleted ? classes.progressCompleted : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {!isCompleted && !isFinished && <p className={classes.hint}>Double tap to mark a set</p>}
    </div>
  );
};

export default WorkoutSessionExerciseCard;
