import { getExerciseNumericFieldError } from '../exercise-numeric-validation';

describe('getExerciseNumericFieldError', () => {
  it('names what is wrong with each number by a code', () => {
    expect(getExerciseNumericFieldError({ weight: null, reps: 1, sets: 1 }, 'weight')).toBe('weightInvalid');
    expect(getExerciseNumericFieldError({ weight: -1, reps: 1, sets: 1 }, 'weight')).toBe('weightNegative');
    expect(getExerciseNumericFieldError({ weight: 0, reps: Number.NaN, sets: 1 }, 'reps')).toBe('repsInvalid');
    expect(getExerciseNumericFieldError({ weight: 0, reps: 0, sets: 1 }, 'reps')).toBe('repsNotPositive');
    expect(getExerciseNumericFieldError({ weight: 0, reps: 1, sets: null }, 'sets')).toBe('setsInvalid');
    expect(getExerciseNumericFieldError({ weight: 0, reps: 1, sets: 0 }, 'sets')).toBe('setsNotPositive');
  });

  it('passes a zero weight and positive reps and sets', () => {
    expect(getExerciseNumericFieldError({ weight: 0, reps: 1, sets: 1 }, 'weight')).toBeUndefined();
    expect(getExerciseNumericFieldError({ weight: 0, reps: 1, sets: 1 }, 'reps')).toBeUndefined();
    expect(getExerciseNumericFieldError({ weight: 0, reps: 1, sets: 1 }, 'sets')).toBeUndefined();
  });
});
