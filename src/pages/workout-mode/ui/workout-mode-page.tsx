import type { WorkoutExercise, WorkoutList } from '@entities';
import { Transition } from '@headlessui/react';
import { Link } from '@tanstack/react-router';
import { FC } from 'react';

import { muscleGroupLabels } from '@entities';
import { Button } from '@shared';
import classes from 'src/pages/workout-mode/ui/workout-mode-page.module.scss';

type Props = {
  currentWorkout: WorkoutList | null;
  justCompleted: string | null;
  totalExercises: number;
  completedExercises: number;
  overallProgress: number;
  onTap: (exerciseId: string) => void;
  onResetAll: () => void;
};

const WorkoutModePage: FC<Props> = ({
  currentWorkout,
  justCompleted,
  totalExercises,
  completedExercises,
  overallProgress,
  onTap,
  onResetAll,
}) => {
  if (!currentWorkout) {
    return (
      <div className={classes.container}>
        <div className={classes.notFound}>
          <h2>Workout list not found</h2>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
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
          <button type="button" className={classes.resetButton} onClick={onResetAll}>
            Reset
          </button>
        </div>
        <h1>{currentWorkout.name}</h1>
        {currentWorkout.description && <p className={classes.description}>{currentWorkout.description}</p>}
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
          {currentWorkout.exercises.map((exercise: WorkoutExercise) => {
            const progress = (exercise.completedSets / exercise.sets) * 100;
            const isCompleted = exercise.completedSets === exercise.sets;

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

                {!isCompleted && <p className={classes.hint}>Double tap to mark a set</p>}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default WorkoutModePage;
