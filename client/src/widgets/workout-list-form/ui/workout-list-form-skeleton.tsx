import { FC } from 'react';

import { Skeleton } from '@shared/ui';

import classes from './workout-list-form.module.scss';

/**
 * The shape of the list form while the list it edits loads: the title, the name and description fields, three
 * exercise cards and the two actions, in the same sections and geometry as the form itself.
 */
const WorkoutListFormSkeleton: FC = () => (
  <div className={classes.container}>
    <header className={classes.header}>
      <div className={classes.titleSkeleton}>
        <Skeleton width="14rem" height="1.5rem" />
      </div>
    </header>

    <main className={classes.main}>
      <div role="status" aria-label="Loading workout list" className={classes.form}>
        <div className={classes.section}>
          <div>
            <div className={classes.label}>
              <Skeleton width="5rem" height="1.3125rem" />
            </div>
            <Skeleton variant="rect" height="2.45rem" />
          </div>
          <div>
            <div className={classes.label}>
              <Skeleton width="5.5rem" height="1.3125rem" />
            </div>
            <Skeleton variant="rect" height="4.15rem" />
          </div>
        </div>

        <div className={`${classes.section} ${classes.section_withoutGap}`}>
          <div className={classes.sectionHeader}>
            <Skeleton width="6rem" height="1.5rem" />
            <Skeleton variant="rect" width="7.5rem" height="2.25rem" />
          </div>
          <div className={classes.exerciseList}>
            {Array.from({ length: 3 }, (_: unknown, index: number) => (
              <div key={index} className={classes.exerciseCard}>
                <div className={classes.exerciseHeader}>
                  <Skeleton variant="circle" width="28px" height="28px" />
                  <Skeleton variant="rect" width="44px" height="44px" />
                </div>
                <div>
                  <div className={classes.label}>
                    <Skeleton width="3rem" height="1.3125rem" />
                  </div>
                  <Skeleton variant="rect" height="2.45rem" />
                </div>
                <div>
                  <div className={classes.label}>
                    <Skeleton width="5.5rem" height="1.3125rem" />
                  </div>
                  <Skeleton variant="rect" height="2.75rem" />
                </div>
                <div className={classes.fieldRow}>
                  {Array.from({ length: 3 }, (__: unknown, field: number) => (
                    <div key={field}>
                      <div className={classes.label}>
                        <Skeleton width="3.5rem" height="1.3125rem" />
                      </div>
                      <Skeleton variant="rect" height="2.45rem" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={classes.actions}>
          <Skeleton variant="rect" height="44px" className={classes.actionSkeleton} />
          <Skeleton variant="rect" height="44px" className={classes.actionSkeleton} />
        </div>
      </div>
    </main>
  </div>
);

export default WorkoutListFormSkeleton;
