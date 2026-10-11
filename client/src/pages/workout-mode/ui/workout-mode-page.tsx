import { Link } from '@tanstack/react-router';
import { FC } from 'react';

import { type WorkoutExercise, WorkoutExerciseCard } from '@entities/workout-exercise';
import type { WorkoutList } from '@entities/workout-list';
import type { WorkoutSession } from '@entities/workout-session';
import { type WorkoutSessionExercise, WorkoutSessionExerciseCard } from '@entities/workout-session-exercise';
import { cssVars } from '@shared/lib';
import { NotFoundMessage } from '@shared/ui';

import classes from './workout-mode-page.module.scss';
import { PREVIEW_HINT } from '../config/preview-hint';
import type { WorkoutPhase } from '../model/workout-phase';

type Props = {
  phase: WorkoutPhase;
  workoutList: WorkoutList | null;
  session: WorkoutSession | null;
  justCompleted: string | null;
  isFinished: boolean;
  totalExercises: number;
  completedExercises: number;
  overallProgress: number;
  isStarting: boolean;
  onTap: (exerciseId: string) => void;
  onStart: () => void;
  onFinish: () => void;
};

const WorkoutModePage: FC<Props> = ({
  phase,
  workoutList,
  session,
  justCompleted,
  isFinished,
  totalExercises,
  completedExercises,
  overallProgress,
  isStarting,
  onTap,
  onStart,
  onFinish,
}) => {
  if (!workoutList) {
    // TODO: Distinguish query errors from a missing list — not only "Workout list not found" (see data layer)
    return (
      <div className={classes.container}>
        <NotFoundMessage title="Workout list not found" />
      </div>
    );
  }

  const listName = phase === 'training' && session ? session.workoutListName : workoutList.name;

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <div className={classes.headerTop}>
          <Link to="/" className={classes.backButton}>
            ← Back
          </Link>
        </div>
        <h1>{listName}</h1>
        <div className={classes.overallProgress}>
          <div className={classes.progressInfo}>
            <span>
              {completedExercises} / {totalExercises} exercises
            </span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className={classes.progressBarWrapper}>
            <div className={classes.progressBarFill} style={cssVars({ '--progress': `${overallProgress}%` })} />
          </div>
        </div>
      </header>

      <main className={classes.main}>
        {phase === 'preview' ? (
          <div className={classes.previewStart}>
            <p className={classes.previewHint}>{PREVIEW_HINT}</p>
            <div className={classes.actionBar}>
              <button type="button" className={classes.actionButton} onClick={onStart} disabled={isStarting}>
                {isStarting ? 'Starting…' : 'Start workout'}
              </button>
            </div>
            <div className={`${classes.exerciseList} ${classes.previewExerciseList}`}>
              {workoutList.exercises.map((exercise: WorkoutExercise) => (
                <WorkoutExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          </div>
        ) : (
          session && (
            <>
              <div className={classes.exerciseList}>
                {session.exercises.map((exercise: WorkoutSessionExercise) => (
                  <WorkoutSessionExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    justCompleted={justCompleted === exercise.id}
                    isFinished={isFinished}
                    onTap={onTap}
                  />
                ))}
              </div>

              <div className={classes.actionBar}>
                <button type="button" className={classes.actionButton} onClick={onFinish} disabled={isFinished}>
                  {isFinished ? 'Workout completed' : 'Finish workout'}
                </button>
              </div>
            </>
          )
        )}
      </main>
    </div>
  );
};

export default WorkoutModePage;
