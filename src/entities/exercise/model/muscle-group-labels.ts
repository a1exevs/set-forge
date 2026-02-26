import type { MuscleGroup } from 'src/entities/exercise/model/types';

export const muscleGroupLabels: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  legs: 'Legs',
  shoulders: 'Shoulders',
  arms: 'Arms',
  core: 'Core',
  cardio: 'Cardio',
};

export const muscleGroups: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'];
