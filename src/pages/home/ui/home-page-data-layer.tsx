import { FC, useEffect, useState } from 'react';

import { useWorkoutListStore, workoutListStorage } from '@entities';
import { formatDate } from '@shared';

import HomePageLogicLayer from 'src/pages/home/ui/home-page-logic-layer';

const HomePageDataLayer: FC = () => {
  const workoutLists = useWorkoutListStore.use.workoutLists();
  const loadFromStorage = useWorkoutListStore.use.loadFromStorage();
  const deleteWorkoutList = useWorkoutListStore.use.deleteWorkoutList();

  const [storageWarning, setStorageWarning] = useState<boolean>(false);

  useEffect((): void => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect((): void => {
    const checkUsage = async (): Promise<void> => {
      const percentage = await workoutListStorage.getUsagePercentageAsync();
      setStorageWarning(percentage >= 80);
    };
    checkUsage();
  }, [workoutLists]);

  const handleDelete = (id: string, name: string): void => {
    if (confirm(`Delete workout list "${name}"?`)) {
      deleteWorkoutList(id);
      workoutListStorage.getUsagePercentageAsync().then((percentage): void => {
        setStorageWarning(percentage >= 80);
      });
    }
  };

  return (
    <HomePageLogicLayer
      workoutLists={workoutLists}
      storageWarning={storageWarning}
      onDelete={handleDelete}
      formatDate={formatDate}
    />
  );
};

export default HomePageDataLayer;
