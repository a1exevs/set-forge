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

export type WorkoutListsExportMethod = 'download' | 'share' | 'clipboard' | 'manual' | 'options';

export type WorkoutListsExportResult =
  | { method: 'download' }
  | { method: 'share' }
  | { method: 'clipboard'; filename: string }
  | { method: 'manual'; json: string; filename: string }
  | { method: 'options'; json: string; filename: string };

export type ShareWorkoutListsExportResult = 'shared' | 'cancelled' | 'unavailable';

type TelegramWebviewWindow = Window & {
  TelegramWebview?: unknown;
  TelegramWebviewProxy?: unknown;
};

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

export const isTelegramWebview = (windowObject: TelegramWebviewWindow): boolean =>
  windowObject.TelegramWebview !== undefined || windowObject.TelegramWebviewProxy !== undefined;

export const isRestrictedDownloadEnvironment = (userAgent: string, windowObject: TelegramWebviewWindow): boolean =>
  isTelegramWebview(windowObject) || /Telegram/i.test(userAgent);

export const downloadWorkoutListsExport = (payload: WorkoutListsExportPayload): boolean => {
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

export const shareWorkoutListsExport = async (
  payload: WorkoutListsExportPayload,
): Promise<ShareWorkoutListsExportResult> => {
  if (typeof navigator.share !== 'function') {
    return 'unavailable';
  }

  const shareData: ShareData = {
    files: [payload.file],
    title: 'Set Forge workout lists',
    text: 'Workout lists backup',
  };

  if (typeof navigator.canShare === 'function' && !navigator.canShare(shareData)) {
    return 'unavailable';
  }

  try {
    await navigator.share(shareData);
    return 'shared';
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return 'cancelled';
    }
    return 'unavailable';
  }
};

export const copyWorkoutListsExport = async (payload: WorkoutListsExportPayload): Promise<boolean> => {
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
  windowObject: TelegramWebviewWindow = window,
): Promise<WorkoutListsExportResult> => {
  const payload = buildWorkoutListsExportPayload(workoutLists);

  if (isRestrictedDownloadEnvironment(userAgent, windowObject)) {
    return { method: 'options', json: payload.json, filename: payload.filename };
  }

  if (downloadWorkoutListsExport(payload)) {
    return { method: 'download' };
  }

  const shareResult = await shareWorkoutListsExport(payload);
  if (shareResult === 'shared') {
    return { method: 'share' };
  }

  if (await copyWorkoutListsExport(payload)) {
    return { method: 'clipboard', filename: payload.filename };
  }

  return { method: 'manual', json: payload.json, filename: payload.filename };
};
