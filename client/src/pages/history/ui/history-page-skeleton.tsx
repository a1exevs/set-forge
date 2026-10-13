import { FC } from 'react';

import { Skeleton } from '@shared/ui';

import classes from './history-page.module.scss';

type Props = {
  /** Ten fill the first screen while the first page loads; two close the list while the next one does. */
  rows?: number;
  label?: string;
  className?: string;
};

/** The shape of the history rows while they load: the same cards, a title, two meta lines, a chevron. */
const HistoryPageSkeleton: FC<Props> = ({ rows = 10, label = 'Loading history', className }) => (
  <div role="status" aria-label={label} className={className ? `${classes.list} ${className}` : classes.list}>
    {Array.from({ length: rows }, (_: unknown, index: number) => (
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
