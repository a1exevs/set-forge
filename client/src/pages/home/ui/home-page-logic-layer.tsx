import { ChangeEvent, FC, useRef } from 'react';

import type { WorkoutList, WorkoutListsExportFile } from '@entities/workout-list';
import { apiErrorText } from '@shared/api';
import {
  downloadJsonFile,
  type Language,
  toastError,
  toastSuccess,
  useConfirm,
  useLoadingPhase,
  useProgress,
  useT,
} from '@shared/lib';
import { useMainTabSwipe } from '@widgets/main-tabs-bar';

import HomePage from './home-page';
import { buildWorkoutListsExportFilename } from '../lib/workout-lists-export-filename';

type Props = {
  workoutLists: WorkoutList[];
  isLoading: boolean;
  deleteWorkoutList: (id: string) => Promise<void>;
  clearWorkoutSessionCachesForDeletedList: (workoutListId: string) => void;
  exportAllWorkoutLists: () => Promise<WorkoutListsExportFile>;
  importWorkoutLists: (file: WorkoutListsExportFile) => Promise<void>;
  onEdit: (id: string) => void;
  formatDate: (iso: string, language: Language) => string;
};

const HomePageLogicLayer: FC<Props> = ({
  workoutLists,
  isLoading,
  deleteWorkoutList,
  clearWorkoutSessionCachesForDeletedList,
  exportAllWorkoutLists,
  importWorkoutLists,
  onEdit,
  formatDate,
}) => {
  const swipeRef = useMainTabSwipe();
  const confirmDialog = useConfirm();
  const importInputRef = useRef<HTMLInputElement>(null);
  const { run, progressOf } = useProgress<'export'>();
  const { t, language } = useT();
  const loadingPhase = useLoadingPhase(isLoading);

  const handleDelete = async (id: string, name: string): Promise<void> => {
    const ok = await confirmDialog({
      title: t('home.deleteDialog.title'),
      description: t('home.deleteDialog.description', { name }),
      confirmationText: t('common.delete'),
      cancellationText: t('common.cancel'),
      onConfirm: async (): Promise<void> => {
        try {
          await deleteWorkoutList(id);
        } catch (error: unknown) {
          toastError(apiErrorText(error, t) ?? t('home.toasts.listDeleteFailed'));
          throw error;
        }
      },
    });
    if (ok) {
      clearWorkoutSessionCachesForDeletedList(id);
      toastSuccess(t('home.toasts.listDeleted'));
    }
  };

  const handleExport = async (): Promise<void> => {
    try {
      const done = await run('export', async (): Promise<void> => {
        downloadJsonFile(await exportAllWorkoutLists(), buildWorkoutListsExportFilename());
      });
      if (done) {
        toastSuccess(t('home.toasts.listsExported'));
      }
    } catch (error: unknown) {
      toastError(apiErrorText(error, t) ?? t('home.toasts.listsExportFailed'));
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
      toastError(t('home.toasts.invalidFile'));
      return;
    }

    const count = Array.isArray(parsed)
      ? parsed.length
      : typeof parsed === 'object' && parsed !== null && 'workoutLists' in parsed
        ? (parsed as WorkoutListsExportFile).workoutLists.length
        : 0;

    if (count === 0) {
      toastError(t('home.toasts.nothingToImport'));
      return;
    }

    const ok = await confirmDialog({
      title: t('home.importDialog.title'),
      description: t('home.importDialog.description', { count }),
      confirmationText: t('home.importDialog.import'),
      cancellationText: t('common.cancel'),
      onConfirm: async (): Promise<void> => {
        try {
          await importWorkoutLists(parsed as WorkoutListsExportFile);
        } catch (error: unknown) {
          toastError(apiErrorText(error, t) ?? t('home.toasts.listsImportFailed'));
          throw error;
        }
      },
    });
    if (ok) {
      toastSuccess(t('home.toasts.listsImported'));
    }
  };

  return (
    <HomePage
      t={t}
      swipeRef={swipeRef}
      workoutLists={workoutLists}
      loadingPhase={loadingPhase}
      onEdit={onEdit}
      onDelete={handleDelete}
      exportProgress={progressOf('export')}
      onExport={handleExport}
      onImportClick={handleImportClick}
      onImportFile={handleImportFile}
      importInputRef={importInputRef}
      formatDate={(iso: string): string => formatDate(iso, language)}
    />
  );
};

export default HomePageLogicLayer;
