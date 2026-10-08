import { FC } from 'react';

import { Skeleton } from '@shared/ui';

import classes from './home-page.module.scss';

/**
 * The shape of the workout list cards while the lists load: the same grid and card geometry as the content, each
 * bone the size of the line it stands in for (title, badge, the 44 px menu slot, description, two footer lines).
 * Nine cards — three rows of the desktop grid; the page clips them to the first screen.
 */
const HomePageSkeleton: FC = () => (
  <div role="status" aria-label="Loading workout lists" className={classes.listGrid}>
    {Array.from({ length: 9 }, (_: unknown, index: number) => (
      <div key={index} className={classes.card}>
        <div className={classes.cardContent}>
          <div className={classes.cardHeader}>
            <Skeleton width="55%" height="1.5rem" />
            <Skeleton variant="rect" width="3rem" height="1.675rem" />
            <div className={classes.menuButton}>
              <Skeleton variant="circle" width="1.25rem" height="1.25rem" />
            </div>
          </div>
          <div className={classes.description}>
            <Skeleton width="80%" height="1.3125rem" />
          </div>
          <div className={classes.cardFooter}>
            <Skeleton width="7rem" height="1.125rem" />
            <Skeleton width="8rem" height="1.125rem" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default HomePageSkeleton;
