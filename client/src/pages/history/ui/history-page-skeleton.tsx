import { FC } from 'react';

import { Skeleton } from '@shared/ui';

import classes from './history-page.module.scss';

/** The shape of the history rows while the first page loads: the same cards, a title, two meta lines, a chevron; ten
 * rows, clipped by the page to the first screen. */
const HistoryPageSkeleton: FC = () => (
  <div role="status" aria-label="Loading history" className={classes.list}>
    {Array.from({ length: 10 }, (_: unknown, index: number) => (
      <div key={index} className={classes.card}>
        <div className={`${classes.cardButton} ${classes.cardSkeleton}`}>
          <div className={classes.cardInfo}>
            <div className={classes.cardTitle}>
              <Skeleton width="50%" height="1.35rem" />
            </div>
            <div className={classes.cardMeta}>
              <Skeleton width="6rem" height="1rem" />
              <Skeleton width="9rem" height="1rem" />
            </div>
          </div>
          <Skeleton variant="circle" width="1.25rem" height="1.25rem" />
        </div>
      </div>
    ))}
  </div>
);

export default HistoryPageSkeleton;
