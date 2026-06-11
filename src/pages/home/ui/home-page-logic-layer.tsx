import type { WorkoutList } from '@entities';
import { FC, useEffect, useState } from 'react';

import { useConfirm } from '@shared';

import HomePage from 'src/pages/home/ui/home-page';

type Props = {
  loadFromStorage: () => void;
  workoutLists: WorkoutList[];
  deleteWorkoutList: (id: string) => void;
  onEdit: (id: string) => void;
  formatDate: (date: string | null) => string;
  getUsagePercentageAsync: () => Promise<number>;
};

const HomePageLogicLayer: FC<Props> = ({
  workoutLists,
  deleteWorkoutList,
  onEdit,
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

  const handleExport = (): void => {
    const exportFile = {
      formatVersion: 1,
      app: 'set-forge' as const,
      exportedAt: new Date().toISOString(),
      workoutLists: workoutLists.map(list => ({
        name: list.name,
        description: list.description,
        exercises: list.exercises.map(({ name, muscleGroup, weight, reps, sets }) => ({
          name,
          muscleGroup,
          weight,
          reps,
          sets,
        })),
        createdAt: list.createdAt,
        lastUsedAt: list.lastUsedAt,
      })),
    };
    const day = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(exportFile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `set-forge-workout-lists-${day}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <HomePage
      workoutLists={workoutLists}
      storageWarning={storageWarning}
      onEdit={onEdit}
      onDelete={handleDelete}
      onExport={handleExport}
      formatDate={formatDate}
    />
  );
};

export default HomePageLogicLayer;
