import type { MuscleGroup } from '@entities';

import type { ExerciseFormData } from 'src/widgets/workout-list-form/model/types';

export type ExerciseSubmitPayload = {
  name: string;
  muscleGroup: MuscleGroup;
  weight: number;
  reps: number;
  sets: number;
};

export type ExerciseNumericFieldKey = 'weight' | 'reps' | 'sets';

export const getExerciseNumericFieldError = (
  exercise: Pick<ExerciseFormData, 'weight' | 'reps' | 'sets'>,
  field: ExerciseNumericFieldKey,
): string | undefined => {
  if (field === 'weight') {
    if (exercise.weight === null || Number.isNaN(exercise.weight)) {
      return 'Enter a valid weight';
    }
    if (exercise.weight < 0) {
      return 'Weight cannot be negative';
    }
    return undefined;
  }
  if (field === 'reps') {
    if (exercise.reps === null || Number.isNaN(exercise.reps)) {
      return 'Enter a valid number of reps';
    }
    if (exercise.reps <= 0) {
      return 'Reps must be greater than 0';
    }
    return undefined;
  }
  if (field === 'sets') {
    if (exercise.sets === null || Number.isNaN(exercise.sets)) {
      return 'Enter a valid number of sets';
    }
    if (exercise.sets <= 0) {
      return 'Sets must be greater than 0';
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
