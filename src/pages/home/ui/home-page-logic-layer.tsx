import type { WorkoutList } from '@entities';
import { FC } from 'react';

import HomePage from 'src/pages/home/ui/home-page';

type Props = {
  workoutLists: WorkoutList[];
  storageWarning: boolean;
  onDelete: (id: string, name: string) => void;
  formatDate: (date: string | null) => string;
};

const HomePageLogicLayer: FC<Props> = ({ workoutLists, storageWarning, onDelete, formatDate }) => {
  return (
    <HomePage workoutLists={workoutLists} storageWarning={storageWarning} onDelete={onDelete} formatDate={formatDate} />
  );
};

export default HomePageLogicLayer;
