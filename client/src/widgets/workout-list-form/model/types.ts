import type { MuscleGroup } from '@entities';

export type ExerciseFormData = {
  tempId: string;
  name: string;
  muscleGroup: MuscleGroup;
  weight: number | null;
  reps: number | null;
  sets: number | null;
};
