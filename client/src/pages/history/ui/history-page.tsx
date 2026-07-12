import type { WorkoutSession, WorkoutSessionExercise } from '@entities';
import { useRouterState } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import { FC, RefObject } from 'react';

import { muscleGroupLabels } from '@entities';
import { BrandWordmark, useTabSwipeNavigation } from '@shared';
import { MAIN_TAB_ROUTES, MainTabsBar } from '@widgets';

import classes from 'src/pages/history/ui/history-page.module.scss';

type Props = {
  sessions: WorkoutSession[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  expandedIds: Record<string, boolean>;
  onToggle: (id: string) => void;
  sentinelRef: RefObject<HTMLDivElement>;
  formatSessionDate: (iso: string | null) => string;
  formatSummary: (session: WorkoutSession) => string;
};

const HistoryPage: FC<Props> = ({
  sessions,
  total,
  isLoading,
  isError,
  isFetchingNextPage,
  expandedIds,
  onToggle,
  sentinelRef,
  formatSessionDate,
  formatSummary,
}) => {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const swipeRef = useTabSwipeNavigation({ tabs: MAIN_TAB_ROUTES, activePath: pathname });

  const renderBody = (): JSX.Element => {
    if (isLoading) {
      return (
        <div className={classes.stateMessage}>
          <p>Loading history…</p>
        </div>
      );
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
                      const done = exercise.sets > 0 && exercise.completedSets >= exercise.sets;

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
        {isFetchingNextPage && <div className={classes.loadingRow}>Loading more…</div>}
      </>
    );
  };

  return (
    <div ref={swipeRef} className={classes.container}>
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

      <main className={classes.main}>{renderBody()}</main>

      <MainTabsBar />
    </div>
  );
};

export default HistoryPage;
