import { getExerciseProgress, hasRemainingSets, isExerciseComplete } from '../exercise-progress';

describe('exercise-progress', () => {
  // @invariant workout-session/exercise-complete
  describe('isExerciseComplete', () => {
    it('is complete when every set is done', () => {
      expect(isExerciseComplete({ sets: 3, completedSets: 3 })).toBe(true);
    });

    it('stays complete when completed sets exceed a reduced plan', () => {
      expect(isExerciseComplete({ sets: 2, completedSets: 3 })).toBe(true);
    });

    it('is not complete while sets remain', () => {
      expect(isExerciseComplete({ sets: 3, completedSets: 2 })).toBe(false);
    });

    it('is never complete without planned sets', () => {
      expect(isExerciseComplete({ sets: 0, completedSets: 0 })).toBe(false);
    });
  });

  describe('hasRemainingSets', () => {
    it('allows another set until the plan is reached', () => {
      expect(hasRemainingSets({ sets: 3, completedSets: 2 })).toBe(true);
      expect(hasRemainingSets({ sets: 3, completedSets: 3 })).toBe(false);
      expect(hasRemainingSets({ sets: 0, completedSets: 0 })).toBe(false);
    });
  });

  describe('getExerciseProgress', () => {
    it('returns the completed share in percent', () => {
      expect(getExerciseProgress({ sets: 4, completedSets: 1 })).toBe(25);
    });

    it('caps at 100 and is 0 without planned sets', () => {
      expect(getExerciseProgress({ sets: 2, completedSets: 3 })).toBe(100);
      expect(getExerciseProgress({ sets: 0, completedSets: 0 })).toBe(0);
    });
  });
});
