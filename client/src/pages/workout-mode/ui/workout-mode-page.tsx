import type { WorkoutSession, WorkoutSessionExercise } from '@entities';
import { Transition } from '@headlessui/react';
import { Link } from '@tanstack/react-router';
import { FC } from 'react';

import { muscleGroupLabels } from '@entities';
import { NotFoundMessage } from '@widgets';

import classes from 'src/pages/workout-mode/ui/workout-mode-page.module.scss';

type Props = {
  session: WorkoutSession | null;
  justCompleted: string | null;
  isFinished: boolean;
  totalExercises: number;
  completedExercises: number;
  overallProgress: number;
  onTap: (exerciseId: string) => void;
  onFinish: () => void;
};

const WorkoutModePage: FC<Props> = ({
  session,
  justCompleted,
  isFinished,
  totalExercises,
  completedExercises,
  overallProgress,
  onTap,
  onFinish,
}) => {
  if (!session) {
    // TODO: Distinguish query errors from a missing list — not only "Workout list not found" (see data layer)
    return (
      <div className={classes.container}>
        <NotFoundMessage title="Workout list not found" />
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <div className={classes.headerTop}>
          <Link to="/" className={classes.backButton}>
            ← Back
          </Link>
        </div>
        <h1>{session.workoutListName}</h1>
        <div className={classes.overallProgress}>
          <div className={classes.progressInfo}>
            <span>
              {completedExercises} / {totalExercises} exercises
            </span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className={classes.progressBarWrapper}>
            <div className={classes.progressBarFill} style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
      </header>

      <main className={classes.main}>
        <div className={classes.exerciseList}>
          {session.exercises.map((exercise: WorkoutSessionExercise) => {
            const progress = exercise.sets > 0 ? (exercise.completedSets / exercise.sets) * 100 : 0;
            const isCompleted = exercise.sets > 0 && exercise.completedSets === exercise.sets;

            return (
              <div
                key={exercise.id}
                className={`${classes.exerciseCard} ${isCompleted ? classes.completed : ''}`}
                onClick={(): void => onTap(exercise.id)}
              >
                <div className={classes.exerciseHeader}>
                  <div className={classes.exerciseInfo}>
                    <h3>{exercise.name}</h3>
                    <span className={classes.muscleBadge}>{muscleGroupLabels[exercise.muscleGroup]}</span>
                  </div>
                  <Transition
                    show={justCompleted === exercise.id}
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

                <div className={classes.progressBarContainer}>
                  <div
                    className={`${classes.progressBar} ${isCompleted ? classes.progressCompleted : ''}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {!isCompleted && !isFinished && <p className={classes.hint}>Double tap to mark a set</p>}
              </div>
            );
          })}
        </div>

        <div className={classes.finishBar}>
          <button type="button" className={classes.finishButton} onClick={onFinish} disabled={isFinished}>
            {isFinished ? 'Workout completed' : 'Finish workout'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default WorkoutModePage;
