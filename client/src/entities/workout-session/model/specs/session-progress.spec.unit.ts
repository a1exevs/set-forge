import { countCompletedExercises, isSessionFullyComplete } from '../session-progress';
import type { WorkoutSession } from '../workout-session';

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

describe('session-progress', () => {
  // @invariant workout-session/exercise-complete
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

  // @invariant workout-session/exercise-complete
  describe('isSessionFullyComplete', () => {
    it('is false while any exercise has sets left', () => {
      expect(isSessionFullyComplete(buildSession())).toBe(false);
    });

    it('is true when every exercise is complete, even past a reduced plan', () => {
      const session = buildSession();
      const exercises = session.exercises.map(exercise => ({ ...exercise, completedSets: exercise.sets + 1 }));
      expect(isSessionFullyComplete({ ...session, exercises })).toBe(true);
    });

    it('is false for a session without exercises', () => {
      expect(isSessionFullyComplete(buildSession({ exercises: [] }))).toBe(false);
    });
  });
});
