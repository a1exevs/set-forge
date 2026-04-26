import {
  getExerciseNumericFieldError,
  hasInvalidExerciseName,
  hasInvalidExerciseNumericFields,
  toExerciseSubmitPayload,
} from 'src/widgets/workout-list-form/model/exercise-numeric-validation';
import type { ExerciseFormData } from 'src/widgets/workout-list-form/model/types';

const exercise = (overrides: Partial<ExerciseFormData>): ExerciseFormData => ({
  tempId: 'temp-1',
  name: 'Bench Press',
  muscleGroup: 'chest',
  weight: 50,
  reps: 10,
  sets: 3,
  ...overrides,
});

describe('Exercise numeric validation', () => {
  describe('getExerciseNumericFieldError', (): void => {
    describe('weight', (): void => {
      it('returns message when weight is null', (): void => {
        expect(getExerciseNumericFieldError(exercise({ weight: null }), 'weight')).toBe('Enter a valid weight');
      });

      it('returns message when weight is NaN', (): void => {
        expect(getExerciseNumericFieldError(exercise({ weight: Number.NaN }), 'weight')).toBe('Enter a valid weight');
      });

      it('returns message when weight is negative', (): void => {
        expect(getExerciseNumericFieldError(exercise({ weight: -1 }), 'weight')).toBe('Weight cannot be negative');
      });

      it('returns undefined when weight is zero', (): void => {
        expect(getExerciseNumericFieldError(exercise({ weight: 0 }), 'weight')).toBeUndefined();
      });

      it('returns undefined when weight is positive', (): void => {
        expect(getExerciseNumericFieldError(exercise({ weight: 80.5 }), 'weight')).toBeUndefined();
      });
    });

    describe('reps', (): void => {
      it('returns message when reps is null', (): void => {
        expect(getExerciseNumericFieldError(exercise({ reps: null }), 'reps')).toBe('Enter a valid number of reps');
      });

      it('returns message when reps is NaN', (): void => {
        expect(getExerciseNumericFieldError(exercise({ reps: Number.NaN }), 'reps')).toBe(
          'Enter a valid number of reps',
        );
      });

      it('returns message when reps is zero', (): void => {
        expect(getExerciseNumericFieldError(exercise({ reps: 0 }), 'reps')).toBe('Reps must be greater than 0');
      });

      it('returns message when reps is negative', (): void => {
        expect(getExerciseNumericFieldError(exercise({ reps: -1 }), 'reps')).toBe('Reps must be greater than 0');
      });

      it('returns undefined when reps is positive', (): void => {
        expect(getExerciseNumericFieldError(exercise({ reps: 12 }), 'reps')).toBeUndefined();
      });
    });

    describe('sets', (): void => {
      it('returns message when sets is null', (): void => {
        expect(getExerciseNumericFieldError(exercise({ sets: null }), 'sets')).toBe('Enter a valid number of sets');
      });

      it('returns message when sets is NaN', (): void => {
        expect(getExerciseNumericFieldError(exercise({ sets: Number.NaN }), 'sets')).toBe(
          'Enter a valid number of sets',
        );
      });

      it('returns message when sets is zero', (): void => {
        expect(getExerciseNumericFieldError(exercise({ sets: 0 }), 'sets')).toBe('Sets must be greater than 0');
      });

      it('returns message when sets is negative', (): void => {
        expect(getExerciseNumericFieldError(exercise({ sets: -2 }), 'sets')).toBe('Sets must be greater than 0');
      });

      it('returns undefined when sets is positive', (): void => {
        expect(getExerciseNumericFieldError(exercise({ sets: 4 }), 'sets')).toBeUndefined();
      });
    });
  });

  describe('hasInvalidExerciseNumericFields', (): void => {
    it('returns false when all numeric fields are valid', (): void => {
      expect(hasInvalidExerciseNumericFields(exercise({}))).toBe(false);
    });

    it('returns true when weight is invalid', (): void => {
      expect(hasInvalidExerciseNumericFields(exercise({ weight: null }))).toBe(true);
    });

    it('returns true when reps is invalid', (): void => {
      expect(hasInvalidExerciseNumericFields(exercise({ reps: 0 }))).toBe(true);
    });

    it('returns true when sets is invalid', (): void => {
      expect(hasInvalidExerciseNumericFields(exercise({ sets: null }))).toBe(true);
    });
  });

  describe('hasInvalidExerciseName', (): void => {
    it('returns false for non-empty trimmed name', (): void => {
      expect(hasInvalidExerciseName(exercise({ name: 'Squat' }))).toBe(false);
    });

    it('returns true for empty string', (): void => {
      expect(hasInvalidExerciseName(exercise({ name: '' }))).toBe(true);
    });

    it('returns true for whitespace-only name', (): void => {
      expect(hasInvalidExerciseName(exercise({ name: '   \t' }))).toBe(true);
    });
  });

  describe('toExerciseSubmitPayload', (): void => {
    it('returns trimmed name and numeric fields', (): void => {
      expect(
        toExerciseSubmitPayload(
          exercise({
            name: '  Deadlift  ',
            weight: 100,
            reps: 5,
            sets: 5,
            muscleGroup: 'back',
          }),
        ),
      ).toEqual({
        name: 'Deadlift',
        muscleGroup: 'back',
        weight: 100,
        reps: 5,
        sets: 5,
      });
    });

    it('throws when weight is null', (): void => {
      expect((): void => {
        toExerciseSubmitPayload(exercise({ weight: null }));
      }).toThrow('toExerciseSubmitPayload: invalid numeric fields');
    });

    it('throws when reps is null', (): void => {
      expect((): void => {
        toExerciseSubmitPayload(exercise({ reps: null }));
      }).toThrow('toExerciseSubmitPayload: invalid numeric fields');
    });

    it('throws when sets is null', (): void => {
      expect((): void => {
        toExerciseSubmitPayload(exercise({ sets: null }));
      }).toThrow('toExerciseSubmitPayload: invalid numeric fields');
    });

    it('throws when any numeric field is NaN', (): void => {
      expect((): void => {
        toExerciseSubmitPayload(exercise({ weight: Number.NaN }));
      }).toThrow('toExerciseSubmitPayload: invalid numeric fields');
    });
  });
});
