import { exhaustiveCheck } from '@alexevs/ts-guards';

import type { Translate } from '@shared/lib';

import type { MuscleGroup } from './workout-exercise';

/** The order of the muscle groups wherever a user picks one. */
export const muscleGroups: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'];

/** The label of a stored muscle group in the language of `t`; the value itself stays the key. */
export const muscleGroupLabel = (group: MuscleGroup, t: Translate): string => {
  switch (group) {
    case 'chest':
      return t('muscleGroups.chest');
    case 'back':
      return t('muscleGroups.back');
    case 'legs':
      return t('muscleGroups.legs');
    case 'shoulders':
      return t('muscleGroups.shoulders');
    case 'arms':
      return t('muscleGroups.arms');
    case 'core':
      return t('muscleGroups.core');
    case 'cardio':
      return t('muscleGroups.cardio');
    default:
      // A group the client does not know yet shows as its key
      return exhaustiveCheck(group);
  }
};
