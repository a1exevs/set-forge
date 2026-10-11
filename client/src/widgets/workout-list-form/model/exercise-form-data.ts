import type { MuscleGroup } from '@entities/workout-exercise';

export type ExerciseFormData = {
  tempId: string;
  name: string;
  muscleGroup: MuscleGroup;
  weight: number | null;
  reps: number | null;
  sets: number | null;
};
