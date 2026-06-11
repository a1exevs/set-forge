import type { WorkoutList } from '@entities';

import {
  buildWorkoutListsExportFile,
  buildWorkoutListsExportPayload,
  isRestrictedDownloadEnvironment,
  isTelegramWebview,
} from 'src/shared/model/helpers/export-workout-lists-file';

const workoutList = (overrides: Partial<WorkoutList> = {}): WorkoutList => ({
  id: 'list-1',
  name: 'Push Day',
  description: 'Chest and triceps',
  exercises: [
    {
      id: 'ex-1',
      name: 'Bench Press',
      muscleGroup: 'chest',
      weight: 60,
      reps: 10,
      sets: 3,
      completedSets: 0,
    },
  ],
  createdAt: '2026-06-01T10:00:00.000Z',
  lastUsedAt: null,
  ...overrides,
});

const windowStub = (overrides: Record<string, unknown> = {}): Window =>
  ({
    ...overrides,
  }) as Window;

describe('export-workout-lists-file', () => {
  describe('buildWorkoutListsExportFile', () => {
    it('builds export file without ids and completedSets', () => {
      const result = buildWorkoutListsExportFile([workoutList()]);

      expect(result.formatVersion).toBe(1);
      expect(result.app).toBe('set-forge');
      expect(result.workoutLists).toEqual([
        {
          name: 'Push Day',
          description: 'Chest and triceps',
          exercises: [{ name: 'Bench Press', muscleGroup: 'chest', weight: 60, reps: 10, sets: 3 }],
          createdAt: '2026-06-01T10:00:00.000Z',
          lastUsedAt: null,
        },
      ]);
    });
  });

  describe('buildWorkoutListsExportPayload', () => {
    it('creates json blob and file with dated filename', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-06-11T12:00:00.000Z'));

      const payload = buildWorkoutListsExportPayload([workoutList()]);

      expect(payload.filename).toBe('set-forge-workout-lists-2026-06-11.json');
      expect(payload.json).toContain('"formatVersion": 1');
      expect(payload.blob.type).toBe('application/json');
      expect(payload.file.name).toBe(payload.filename);

      jest.useRealTimers();
    });
  });

  describe('isTelegramWebview', () => {
    it('detects Android Telegram WebView global', () => {
      expect(isTelegramWebview(windowStub({ TelegramWebview: {} }))).toBe(true);
    });

    it('detects iOS Telegram WebView global', () => {
      expect(isTelegramWebview(windowStub({ TelegramWebviewProxy: {} }))).toBe(true);
    });
  });

  describe('isRestrictedDownloadEnvironment', () => {
    it('detects Telegram via user agent fallback', () => {
      expect(isRestrictedDownloadEnvironment('Mozilla/5.0 Telegram-Android', windowStub())).toBe(true);
    });

    it('detects Telegram via WebView globals without Telegram in user agent', () => {
      const chromeUa = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36';

      expect(isRestrictedDownloadEnvironment(chromeUa, windowStub({ TelegramWebview: {} }))).toBe(true);
    });

    it('allows regular Chrome on Android', () => {
      expect(
        isRestrictedDownloadEnvironment(
          'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
          windowStub(),
        ),
      ).toBe(false);
    });
  });
});
