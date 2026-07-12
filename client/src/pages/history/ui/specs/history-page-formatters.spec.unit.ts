import type { WorkoutSession } from '@entities';

import {
  countCompletedExercises,
  formatDuration,
  formatSessionDate,
  formatSummary,
} from 'src/pages/history/ui/history-page-formatters';

const buildSession = (overrides: Partial<WorkoutSession> = {}): WorkoutSession => ({
  id: 'sess-1',
  workoutListId: 'list-1',
  workoutListName: 'Push Day',
  status: 'completed',
  startedAt: '2026-06-03T12:00:00.000Z',
  finishedAt: '2026-06-03T13:00:00.000Z',
  exercises: [
    {
      id: 'ex-1',
      sourceExerciseId: 'tpl-1',
      name: 'Bench Press',
      muscleGroup: 'chest',
      weight: 60,
      reps: 10,
      sets: 3,
      completedSets: 3,
    },
    {
      id: 'ex-2',
      sourceExerciseId: 'tpl-2',
      name: 'Squat',
      muscleGroup: 'legs',
      weight: 80,
      reps: 8,
      sets: 3,
      completedSets: 1,
    },
  ],
  ...overrides,
});

describe('history-page-formatters', () => {
  describe('formatSessionDate', () => {
    it('returns an empty string for a null date', () => {
      expect(formatSessionDate(null)).toBe('');
    });

    it('formats an ISO date in en-US locale', () => {
      expect(formatSessionDate('2026-06-03T12:00:00.000Z')).toMatch(/Jun 3, 2026/);
    });
  });

  describe('countCompletedExercises', () => {
    it('counts exercises where completedSets meets or exceeds sets', () => {
      expect(countCompletedExercises(buildSession())).toBe(1);
    });

    it('ignores exercises with zero sets', () => {
      const session = buildSession({
        exercises: [
          {
            id: 'ex-1',
            sourceExerciseId: null,
            name: 'Stretch',
            muscleGroup: 'back',
            weight: 0,
            reps: 1,
            sets: 0,
            completedSets: 0,
          },
        ],
      });

      expect(countCompletedExercises(session)).toBe(0);
    });
  });

  describe('formatDuration', () => {
    it('returns null when finishedAt is missing', () => {
      expect(formatDuration(buildSession({ finishedAt: null }))).toBeNull();
    });

    it('formats sub-hour durations in minutes', () => {
      expect(
        formatDuration(
          buildSession({
            startedAt: '2026-06-03T12:00:00.000Z',
            finishedAt: '2026-06-03T12:45:00.000Z',
          }),
        ),
      ).toBe('45 min');
    });

    it('formats whole-hour durations without trailing minutes', () => {
      expect(formatDuration(buildSession())).toBe('1 h');
    });

    it('formats hour and minute durations', () => {
      expect(
        formatDuration(
          buildSession({
            startedAt: '2026-06-03T12:00:00.000Z',
            finishedAt: '2026-06-03T13:30:00.000Z',
          }),
        ),
      ).toBe('1 h 30 min');
    });
  });

  describe('formatSummary', () => {
    it('includes exercise progress and duration', () => {
      expect(formatSummary(buildSession())).toBe('1/2 exercises · 1 h');
    });

    it('omits duration when it cannot be derived', () => {
      expect(formatSummary(buildSession({ finishedAt: null }))).toBe('1/2 exercises');
    });

    it('uses the singular exercise label for a single exercise', () => {
      const session = buildSession();
      expect(
        formatSummary({
          ...session,
          exercises: session.exercises.slice(0, 1),
        }),
      ).toBe('1/1 exercise · 1 h');
    });
  });
});
