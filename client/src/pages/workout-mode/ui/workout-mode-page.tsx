import { Link } from '@tanstack/react-router';
import { FC } from 'react';

import { type WorkoutExercise, WorkoutExerciseCard } from '@entities/workout-exercise';
import type { WorkoutList } from '@entities/workout-list';
import type { WorkoutSession } from '@entities/workout-session';
import { type WorkoutSessionExercise, WorkoutSessionExerciseCard } from '@entities/workout-session-exercise';
import { cssVars, type LoadingPhase, type Progress, type Translate } from '@shared/lib';
import { Button, NotFoundMessage } from '@shared/ui';

import WorkoutModePageSkeleton from './workout-mode-page-skeleton';
import classes from './workout-mode-page.module.scss';
import type { WorkoutPhase } from '../model/workout-phase';

type Props = {
  t: Translate;
  loadingPhase: LoadingPhase;
  phase: WorkoutPhase;
  workoutList: WorkoutList | null;
  session: WorkoutSession | null;
  justCompleted: string | null;
  isFinished: boolean;
  totalExercises: number;
  completedExercises: number;
  overallProgress: number;
  startProgress: Progress;
  onTap: (exerciseId: string) => void;
  onStart: () => void;
  onFinish: () => void;
};

const WorkoutModePage: FC<Props> = ({
  t,
  loadingPhase,
  phase,
  workoutList,
  session,
  justCompleted,
  isFinished,
  totalExercises,
  completedExercises,
  overallProgress,
  startProgress,
  onTap,
  onStart,
  onFinish,
}) => {
  if (loadingPhase === 'skeleton') {
    return <WorkoutModePageSkeleton t={t} />;
  }
  // Before the skeleton is due: a list that comes sooner shows with no skeleton
  if (loadingPhase === 'blank') {
    return null;
  }

  if (!workoutList) {
    // TODO: Distinguish query errors from a missing list — not only "Workout list not found" (see data layer)
    return (
      <div className={classes.container}>
        <NotFoundMessage title={t('workoutList.notFound')} backToLabel={t('common.backToHome')} />
      </div>
    );
  }

  const listName = phase === 'training' && session ? session.workoutListName : workoutList.name;

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <div className={classes.headerTop}>
          <Link to="/" className={classes.backButton}>
            ← {t('common.back')}
          </Link>
        </div>
        <h1>{listName}</h1>
        <div className={classes.overallProgress}>
          <div className={classes.progressInfo}>
            <span>{t('workoutMode.progress', { completed: completedExercises, count: totalExercises })}</span>
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
            <p className={classes.previewHint}>{t('workoutMode.previewHint')}</p>
            <div className={classes.actionBar}>
              <Button variant="accent" className={classes.startButton} progress={startProgress} onClick={onStart}>
                {t('workoutMode.start')}
              </Button>
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
                  {isFinished ? t('workoutMode.completed') : t('workoutMode.finish')}
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
