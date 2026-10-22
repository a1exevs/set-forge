import { exhaustiveCheck } from '@alexevs/ts-guards';

import type { Translate } from '@shared/lib';

import type { ExerciseNumericError } from '../model/exercise-numeric-validation';

export const exerciseErrorText = (error: ExerciseNumericError, t: Translate): string => {
  switch (error) {
    case 'weightInvalid':
      return t('workoutListForm.errors.weightInvalid');
    case 'weightNegative':
      return t('workoutListForm.errors.weightNegative');
    case 'repsInvalid':
      return t('workoutListForm.errors.repsInvalid');
    case 'repsNotPositive':
      return t('workoutListForm.errors.repsNotPositive');
    case 'setsInvalid':
      return t('workoutListForm.errors.setsInvalid');
    case 'setsNotPositive':
      return t('workoutListForm.errors.setsNotPositive');
    default:
      return exhaustiveCheck(error);
  }
};
