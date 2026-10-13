import { ChevronDown } from 'lucide-react';
import { FC, RefObject } from 'react';

import { muscleGroupLabels } from '@entities/workout-exercise';
import type { WorkoutSession } from '@entities/workout-session';
import { isExerciseComplete, type WorkoutSessionExercise } from '@entities/workout-session-exercise';
import type { LoadingPhase } from '@shared/lib';
import { BrandWordmark } from '@shared/ui';
import { MainTabsBar } from '@widgets/main-tabs-bar';

import HistoryPageSkeleton from './history-page-skeleton';
import classes from './history-page.module.scss';

type Props = {
  swipeRef: RefObject<HTMLDivElement>;
  sessions: WorkoutSession[];
  total: number;
  loadingPhase: LoadingPhase;
  isError: boolean;
  /** The next page is loading: placeholder rows close the list. */
  showNextPageSkeleton: boolean;
  expandedIds: Record<string, boolean>;
  onToggle: (id: string) => void;
  sentinelRef: RefObject<HTMLDivElement>;
  formatSessionDate: (iso: string | null) => string;
  formatSummary: (session: WorkoutSession) => string;
};

const HistoryPage: FC<Props> = ({
  swipeRef,
  sessions,
  total,
  loadingPhase,
  isError,
  showNextPageSkeleton,
  expandedIds,
  onToggle,
  sentinelRef,
  formatSessionDate,
  formatSummary,
}) => {
  const renderBody = (): JSX.Element | null => {
    if (loadingPhase === 'skeleton') {
      return <HistoryPageSkeleton />;
    }
    if (loadingPhase === 'blank') {
      return null;
    }

    if (isError) {
      return (
        <div className={classes.stateMessage}>
          <p>Could not load your workout history</p>
          <p className={classes.emptyHint}>Please try again later</p>
        </div>
      );
    }

    if (sessions.length === 0) {
      return (
        <div className={classes.empty}>
          <p>No completed workouts yet</p>
          <p className={classes.emptyHint}>Finish a workout to see it here</p>
        </div>
      );
    }

    return (
      <>
        <div className={classes.list}>
          {sessions.map((session: WorkoutSession) => {
            const isOpen = Boolean(expandedIds[session.id]);

            return (
              <div key={session.id} className={classes.card}>
                <button
                  type="button"
                  className={classes.cardButton}
                  aria-expanded={isOpen}
                  onClick={(): void => onToggle(session.id)}
                >
                  <div className={classes.cardInfo}>
                    <h2 className={classes.cardTitle}>{session.workoutListName}</h2>
                    <div className={classes.cardMeta}>
                      <span>{formatSessionDate(session.finishedAt ?? session.startedAt)}</span>
                      <span>{formatSummary(session)}</span>
                    </div>
                  </div>
                  <ChevronDown
                    className={isOpen ? `${classes.chevron} ${classes.chevronOpen}` : classes.chevron}
                    size={20}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </button>

                {isOpen && (
                  <div className={classes.details}>
                    {session.exercises.map((exercise: WorkoutSessionExercise) => {
                      const done = isExerciseComplete(exercise);

                      return (
                        <div key={exercise.id} className={classes.exerciseRow}>
                          <div className={classes.exerciseMain}>
                            <div className={classes.exerciseName}>
                              {exercise.name}
                              <span className={classes.muscleBadge}>{muscleGroupLabels[exercise.muscleGroup]}</span>
                            </div>
                            <div className={classes.exerciseSub}>
                              {exercise.weight} kg × {exercise.reps} reps
                            </div>
                          </div>
                          <span
                            className={
                              done ? `${classes.exerciseSets} ${classes.exerciseSetsDone}` : classes.exerciseSets
                            }
                          >
                            {exercise.completedSets}/{exercise.sets}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div ref={sentinelRef} className={classes.sentinel} aria-hidden />
        {showNextPageSkeleton && (
          <HistoryPageSkeleton rows={2} label="Loading more history" className={classes.nextPageSkeleton} />
        )}
      </>
    );
  };

  return (
    <div
      ref={swipeRef}
      className={loadingPhase === 'skeleton' ? `${classes.container} ${classes.containerLoading}` : classes.container}
    >
      <header className={classes.header}>
        <div className={classes.headerTop}>
          <BrandWordmark title="History" />
          {total > 0 && (
            <span className={classes.count}>
              {total} workout{total === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </header>

      <main className={classes.main} aria-busy={loadingPhase !== 'content'}>
        {renderBody()}
      </main>

      <MainTabsBar />
    </div>
  );
};

export default HistoryPage;
