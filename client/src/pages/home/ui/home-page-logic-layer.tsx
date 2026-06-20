import type { WorkoutList, WorkoutListsExportFile } from '@entities';
import { ChangeEvent, FC, useRef } from 'react';

import { buildWorkoutListsExportFilename, downloadJsonFile, useConfirm } from '@shared';

import HomePage from 'src/pages/home/ui/home-page';

type Props = {
  workoutLists: WorkoutList[];
  deleteWorkoutList: (id: string) => Promise<void>;
  exportAllWorkoutLists: () => Promise<WorkoutListsExportFile>;
  importWorkoutLists: (file: WorkoutListsExportFile) => Promise<void>;
  onEdit: (id: string) => void;
  formatDate: (date: string | null) => string;
};

const HomePageLogicLayer: FC<Props> = ({
  workoutLists,
  deleteWorkoutList,
  exportAllWorkoutLists,
  importWorkoutLists,
  onEdit,
  formatDate,
}) => {
  const confirmDialog = useConfirm();
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = async (id: string, name: string): Promise<void> => {
    const ok = await confirmDialog({
      title: 'Delete workout list?',
      description: `Delete "${name}"? This cannot be undone.`,
      confirmationText: 'Delete',
      cancellationText: 'Cancel',
    });
    if (ok) {
      await deleteWorkoutList(id);
    }
  };

  const handleExport = async (): Promise<void> => {
    try {
      const data = await exportAllWorkoutLists();
      downloadJsonFile(data, buildWorkoutListsExportFilename());
    } catch (error) {
      await confirmDialog({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export workout lists',
        confirmationText: 'OK',
        cancellationText: 'Close',
      });
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
      await confirmDialog({
        title: 'Import failed',
        description: 'The selected file is not valid JSON.',
        confirmationText: 'OK',
        cancellationText: 'Close',
      });
      return;
    }

    const count = Array.isArray(parsed)
      ? parsed.length
      : typeof parsed === 'object' && parsed !== null && 'workoutLists' in parsed
        ? (parsed as WorkoutListsExportFile).workoutLists.length
        : 0;

    if (count === 0) {
      await confirmDialog({
        title: 'Import failed',
        description: 'The file does not contain any workout lists to import.',
        confirmationText: 'OK',
        cancellationText: 'Close',
      });
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
    } catch (error) {
      await confirmDialog({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import workout lists',
        confirmationText: 'OK',
        cancellationText: 'Close',
      });
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
