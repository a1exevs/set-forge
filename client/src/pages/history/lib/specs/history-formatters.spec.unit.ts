import { t, tRu } from 'tests/common/translate';

import type { WorkoutSession } from '@entities/workout-session';

import { formatDuration, formatSessionDate, formatSummary } from '../history-formatters';

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
      expect(formatSessionDate(null, 'en')).toBe('');
    });

    it('formats the date with the year in the order and names of the language', () => {
      expect(formatSessionDate('2026-06-03T12:00:00.000Z', 'en')).toBe('Jun 3, 2026');
      expect(formatSessionDate('2026-06-03T12:00:00.000Z', 'ru')).toBe('3 июн. 2026 г.');
    });
  });

  describe('formatDuration', () => {
    it('returns null when finishedAt is missing', () => {
      expect(formatDuration(buildSession({ finishedAt: null }), t)).toBeNull();
    });

    it('formats sub-hour durations in minutes', () => {
      expect(
        formatDuration(
          buildSession({
            startedAt: '2026-06-03T12:00:00.000Z',
            finishedAt: '2026-06-03T12:45:00.000Z',
          }),
          t,
        ),
      ).toBe('45 min');
    });

    it('formats whole-hour durations without trailing minutes', () => {
      expect(formatDuration(buildSession(), t)).toBe('1 h');
    });

    it('formats hour and minute durations', () => {
      expect(
        formatDuration(
          buildSession({
            startedAt: '2026-06-03T12:00:00.000Z',
            finishedAt: '2026-06-03T13:30:00.000Z',
          }),
          t,
        ),
      ).toBe('1 h 30 min');
    });

    it('says the duration in the language', () => {
      const session = buildSession({ startedAt: '2026-06-03T12:00:00.000Z', finishedAt: '2026-06-03T13:30:00.000Z' });

      expect(formatDuration(session, tRu)).toBe('1 ч 30 мин');
    });
  });

  describe('formatSummary', () => {
    it('includes exercise progress and duration', () => {
      expect(formatSummary(buildSession(), t)).toBe('1/2 exercises · 1 h');
    });

    it('omits duration when it cannot be derived', () => {
      expect(formatSummary(buildSession({ finishedAt: null }), t)).toBe('1/2 exercises');
    });

    it('uses the singular exercise label for a single exercise', () => {
      const session = buildSession();
      expect(
        formatSummary(
          {
            ...session,
            exercises: session.exercises.slice(0, 1),
          },
          t,
        ),
      ).toBe('1/1 exercise · 1 h');
    });

    // AC-2 of #112: the exercises in the plural form of the language
    it.each([
      [1, '0/1 упражнение'],
      [2, '0/2 упражнения'],
      [5, '0/5 упражнений'],
      [11, '0/11 упражнений'],
      [21, '0/21 упражнение'],
      [22, '0/22 упражнения'],
    ])('counts %i exercises in Russian', (total: number, summary: string) => {
      const [exercise] = buildSession().exercises;
      if (!exercise) {
        throw new Error('no exercise in the fixture');
      }
      const session = buildSession({
        finishedAt: null,
        exercises: Array.from({ length: total }, (_: unknown, index: number) => ({
          ...exercise,
          id: `ex-${index}`,
          completedSets: 0,
        })),
      });

      expect(formatSummary(session, tRu)).toBe(summary);
    });
  });
});
