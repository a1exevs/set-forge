import type { WorkoutList, WorkoutListsExportFile } from '@entities';
import { ChangeEvent, FC, useRef } from 'react';

import { buildWorkoutListsExportFilename, downloadJsonFile, toastError, toastSuccess, useConfirm } from '@shared';

import HomePage from 'src/pages/home/ui/home-page';

type Props = {
  workoutLists: WorkoutList[];
  deleteWorkoutList: (id: string) => Promise<void>;
  clearWorkoutSessionCachesForDeletedList: (workoutListId: string) => void;
  exportAllWorkoutLists: () => Promise<WorkoutListsExportFile>;
  importWorkoutLists: (file: WorkoutListsExportFile) => Promise<void>;
  onEdit: (id: string) => void;
  formatDate: (date: string | null) => string;
};

const HomePageLogicLayer: FC<Props> = ({
  workoutLists,
  deleteWorkoutList,
  clearWorkoutSessionCachesForDeletedList,
  exportAllWorkoutLists,
  importWorkoutLists,
  onEdit,
  formatDate,
}) => {
  const confirmDialog = useConfirm();
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = async (id: string, name: string): Promise<void> => {
    try {
      const ok = await confirmDialog({
        title: 'Delete workout list?',
        description: `Delete "${name}"? This cannot be undone.`,
        confirmationText: 'Delete',
        cancellationText: 'Cancel',
      });
      if (ok) {
        await deleteWorkoutList(id);
        clearWorkoutSessionCachesForDeletedList(id);
        toastSuccess('Workout list deleted');
      }
    } catch (error: unknown) {
      toastError(error, 'Failed to delete workout list');
    }
  };

  const handleExport = async (): Promise<void> => {
    try {
      const data = await exportAllWorkoutLists();
      downloadJsonFile(data, buildWorkoutListsExportFilename());
      toastSuccess('Workout lists exported');
    } catch (error: unknown) {
      toastError(error, 'Failed to export workout lists');
    }
  };

  const handleImportClick = (): void => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      toastError(null, 'The selected file is not valid JSON.');
      return;
    }

    const count = Array.isArray(parsed)
      ? parsed.length
      : typeof parsed === 'object' && parsed !== null && 'workoutLists' in parsed
        ? (parsed as WorkoutListsExportFile).workoutLists.length
        : 0;

    if (count === 0) {
      toastError(null, 'The file does not contain any workout lists to import.');
      return;
    }

    const ok = await confirmDialog({
      title: 'Import workout lists?',
      description: `Import ${count} workout list${count === 1 ? '' : 's'}?`,
      confirmationText: 'Import',
      cancellationText: 'Cancel',
    });
    if (!ok) {
      return;
    }

    try {
      await importWorkoutLists(parsed as WorkoutListsExportFile);
      toastSuccess('Workout lists imported');
    } catch (error: unknown) {
      toastError(error, 'Failed to import workout lists');
    }
  };

  return (
    <HomePage
      workoutLists={workoutLists}
      onEdit={onEdit}
      onDelete={handleDelete}
      onExport={handleExport}
      onImportClick={handleImportClick}
      onImportFile={handleImportFile}
      importInputRef={importInputRef}
      formatDate={formatDate}
    />
  );
};

export default HomePageLogicLayer;
