import { FC } from 'react';

import { useT } from '@shared/lib';

import WorkoutListFormSkeleton from './workout-list-form-skeleton';

const WorkoutListFormSkeletonLogicLayer: FC = () => {
  const { t } = useT();

  return <WorkoutListFormSkeleton t={t} />;
};

export default WorkoutListFormSkeletonLogicLayer;
