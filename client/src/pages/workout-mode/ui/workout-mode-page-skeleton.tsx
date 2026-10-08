import { Link } from '@tanstack/react-router';
import { FC } from 'react';

import { Skeleton } from '@shared/ui';

import classes from './workout-mode-page.module.scss';

/**
 * The shape of the workout screen while the list and the active session load: the real way back, a title and the
 * progress in the header, five exercise cards below — the same geometry the preview and the training show — clipped
 * to the first screen, so the placeholders fill it and never scroll.
 */
const WorkoutModePageSkeleton: FC = () => (
  <div className={`${classes.container} ${classes.containerLoading}`}>
    <header className={classes.header}>
      <div className={classes.headerTop}>
        <Link to="/" className={classes.backButton}>
          ← Back
        </Link>
      </div>
      <div className={classes.titleSkeleton}>
        <Skeleton width="12rem" height="1.5rem" />
      </div>
      <div className={classes.overallProgress}>
        <div className={classes.progressInfo}>
          <Skeleton width="6rem" height="1.3125rem" />
          <Skeleton width="2.5rem" height="1.3125rem" />
        </div>
        <Skeleton variant="rect" height="8px" className={classes.progressBarSkeleton} />
      </div>
    </header>

    <main className={classes.main}>
      <div
        role="status"
        aria-label="Loading workout"
        className={`${classes.exerciseList} ${classes.exerciseListSkeleton}`}
      >
        {Array.from({ length: 5 }, (_: unknown, index: number) => (
          <div key={index} className={classes.exerciseCardSkeleton}>
            <div className={classes.exerciseHeaderSkeleton}>
              <div className={classes.exerciseInfoSkeleton}>
                <Skeleton width="55%" height="1.35rem" />
                <Skeleton variant="rect" width="4rem" height="1.675rem" />
              </div>
            </div>
            <div className={classes.exerciseDetailsSkeleton}>
              {Array.from({ length: 3 }, (__: unknown, detail: number) => (
                <div key={detail} className={classes.detailSkeleton}>
                  <Skeleton width="3rem" height="1.125rem" />
                  <Skeleton width="2.5rem" height="1.6875rem" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  </div>
);

export default WorkoutModePageSkeleton;
