import type { WorkoutList } from '@entities';

export type WorkoutListsExportFile = {
  formatVersion: 1;
  app: 'set-forge';
  exportedAt: string;
  workoutLists: Array<{
    name: string;
    description: string;
    exercises: Array<{
      name: string;
      muscleGroup: string;
      weight: number;
      reps: number;
      sets: number;
    }>;
    createdAt: string;
    lastUsedAt: string | null;
  }>;
};

export type WorkoutListsExportPayload = {
  json: string;
  filename: string;
  blob: Blob;
  file: File;
};

export type WorkoutListsExportMethod = 'download' | 'share' | 'clipboard' | 'manual';

export type WorkoutListsExportResult =
  | { method: 'download' }
  | { method: 'share' }
  | { method: 'clipboard'; filename: string }
  | { method: 'manual'; json: string; filename: string };

export const buildWorkoutListsExportFile = (workoutLists: WorkoutList[]): WorkoutListsExportFile => ({
  formatVersion: 1,
  app: 'set-forge',
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
});

export const buildWorkoutListsExportPayload = (workoutLists: WorkoutList[]): WorkoutListsExportPayload => {
  const json = JSON.stringify(buildWorkoutListsExportFile(workoutLists), null, 2);
  const day = new Date().toISOString().slice(0, 10);
  const filename = `set-forge-workout-lists-${day}.json`;
  const blob = new Blob([json], { type: 'application/json' });
  const file = new File([blob], filename, { type: 'application/json' });

  return { json, filename, blob, file };
};

export const isRestrictedDownloadEnvironment = (userAgent: string): boolean => /Telegram/i.test(userAgent);

const tryDownload = (payload: WorkoutListsExportPayload): boolean => {
  try {
    const url = URL.createObjectURL(payload.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = payload.filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
};

const tryShare = async (payload: WorkoutListsExportPayload): Promise<boolean> => {
  if (typeof navigator.share !== 'function') {
    return false;
  }

  const shareData: ShareData = {
    files: [payload.file],
    title: 'Set Forge workout lists',
    text: 'Workout lists backup',
  };

  if (typeof navigator.canShare === 'function' && !navigator.canShare(shareData)) {
    return false;
  }

  try {
    await navigator.share(shareData);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return true;
    }
    return false;
  }
};

const tryClipboard = async (payload: WorkoutListsExportPayload): Promise<boolean> => {
  if (!navigator.clipboard?.writeText) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(payload.json);
    return true;
  } catch {
    return false;
  }
};

export const exportWorkoutListsWithFallback = async (
  workoutLists: WorkoutList[],
  userAgent: string = navigator.userAgent,
): Promise<WorkoutListsExportResult> => {
  const payload = buildWorkoutListsExportPayload(workoutLists);
  const restricted = isRestrictedDownloadEnvironment(userAgent);

  if (!restricted && tryDownload(payload)) {
    return { method: 'download' };
  }

  if (await tryShare(payload)) {
    return { method: 'share' };
  }

  if (await tryClipboard(payload)) {
    return { method: 'clipboard', filename: payload.filename };
  }

  return { method: 'manual', json: payload.json, filename: payload.filename };
};
