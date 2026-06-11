import type { WorkoutList } from '@entities';
import { FC, useEffect, useState } from 'react';

import { useConfirm } from '@shared';

import ExportFallbackDialog from 'src/pages/home/ui/export-fallback-dialog';
import HomePage from 'src/pages/home/ui/home-page';
import { exportWorkoutListsWithFallback } from 'src/shared/model/helpers/export-workout-lists-file';

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
  const [exportDialog, setExportDialog] = useState<{
    variant: 'clipboard' | 'manual';
    json: string;
    filename: string;
  } | null>(null);

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

  const handleExport = async (): Promise<void> => {
    const result = await exportWorkoutListsWithFallback(workoutLists);

    if (result.method === 'clipboard') {
      setExportDialog({ variant: 'clipboard', json: '', filename: result.filename });
      return;
    }

    if (result.method === 'manual') {
      setExportDialog({
        variant: 'manual',
        json: result.json,
        filename: result.filename,
      });
    }
  };

  return (
    <>
      <HomePage
        workoutLists={workoutLists}
        storageWarning={storageWarning}
        onEdit={onEdit}
        onDelete={handleDelete}
        onExport={handleExport}
        formatDate={formatDate}
      />
      {exportDialog && (
        <ExportFallbackDialog
          open={true}
          variant={exportDialog.variant}
          json={exportDialog.json}
          filename={exportDialog.filename}
          onClose={(): void => setExportDialog(null)}
        />
      )}
    </>
  );
};

export default HomePageLogicLayer;
