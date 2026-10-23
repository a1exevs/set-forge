import type { MuscleGroup } from '@entities/workout-exercise';

import type { ExerciseFormData } from './exercise-form-data';

export type ExerciseSubmitPayload = {
  name: string;
  muscleGroup: MuscleGroup;
  weight: number;
  reps: number;
  sets: number;
};

export type ExerciseNumericFieldKey = 'weight' | 'reps' | 'sets';

/** What is wrong with a number of an exercise: a code, so the form says it in the chosen language. */
export type ExerciseNumericError =
  | 'weightInvalid'
  | 'weightNegative'
  | 'repsInvalid'
  | 'repsNotPositive'
  | 'setsInvalid'
  | 'setsNotPositive';

export const getExerciseNumericFieldError = (
  exercise: Pick<ExerciseFormData, 'weight' | 'reps' | 'sets'>,
  field: ExerciseNumericFieldKey,
): ExerciseNumericError | undefined => {
  if (field === 'weight') {
    if (exercise.weight === null || Number.isNaN(exercise.weight)) {
      return 'weightInvalid';
    }
    if (exercise.weight < 0) {
      return 'weightNegative';
    }
    return undefined;
  }
  if (field === 'reps') {
    if (exercise.reps === null || Number.isNaN(exercise.reps)) {
      return 'repsInvalid';
    }
    if (exercise.reps <= 0) {
      return 'repsNotPositive';
    }
    return undefined;
  }
  if (field === 'sets') {
    if (exercise.sets === null || Number.isNaN(exercise.sets)) {
      return 'setsInvalid';
    }
    if (exercise.sets <= 0) {
      return 'setsNotPositive';
    }
    return undefined;
  }
  return undefined;
};

export const hasInvalidExerciseNumericFields = (exercise: ExerciseFormData): boolean => {
  return (
    getExerciseNumericFieldError(exercise, 'weight') !== undefined ||
    getExerciseNumericFieldError(exercise, 'reps') !== undefined ||
    getExerciseNumericFieldError(exercise, 'sets') !== undefined
  );
};

export const hasInvalidExerciseName = (exercise: ExerciseFormData): boolean => {
  return !exercise.name.trim();
};

export const toExerciseSubmitPayload = (exercise: ExerciseFormData): ExerciseSubmitPayload => {
  const { weight, reps, sets, name, muscleGroup } = exercise;
  if (
    weight === null ||
    reps === null ||
    sets === null ||
    Number.isNaN(weight) ||
    Number.isNaN(reps) ||
    Number.isNaN(sets)
  ) {
    throw new Error('toExerciseSubmitPayload: invalid numeric fields');
  }
  return {
    name: name.trim(),
    muscleGroup,
    weight,
    reps,
    sets,
  };
};
