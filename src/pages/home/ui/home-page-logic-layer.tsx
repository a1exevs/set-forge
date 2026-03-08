import type { WorkoutList } from '@entities';
import { FC, useEffect, useState } from 'react';

import { useConfirm } from '@shared';

import HomePage from 'src/pages/home/ui/home-page';

type Props = {
  loadFromStorage: () => void;
  workoutLists: WorkoutList[];
  deleteWorkoutList: (id: string) => void;
  formatDate: (date: string | null) => string;
  getUsagePercentageAsync: () => Promise<number>;
};

const HomePageLogicLayer: FC<Props> = ({
  workoutLists,
  deleteWorkoutList,
  formatDate,
  getUsagePercentageAsync,
  loadFromStorage,
}) => {
  const [storageWarning, setStorageWarning] = useState<boolean>(false);

  const confirmDialog = useConfirm();

  const handleDelete = async (id: string, name: string): Promise<void> => {
    const ok = await confirmDialog({
      title: 'Delete workout list?',
      description: `Delete "${name}"? This cannot be undone.`,
      confirmationText: 'Delete',
      cancellationText: 'Cancel',
    });
    if (ok) {
      deleteWorkoutList(id);
    }
  };

  useEffect((): void => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect((): void => {
    const checkUsage = async (): Promise<void> => {
      const percentage = await getUsagePercentageAsync();
      setStorageWarning(percentage >= 80);
    };
    checkUsage();
  }, [workoutLists, getUsagePercentageAsync]);

  return (
    <HomePage
      workoutLists={workoutLists}
      storageWarning={storageWarning}
      onDelete={handleDelete}
      formatDate={formatDate}
    />
  );
};

export default HomePageLogicLayer;
