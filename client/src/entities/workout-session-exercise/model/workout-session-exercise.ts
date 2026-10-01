import type { MuscleGroup } from '@entities/workout-exercise/@x/workout-session-exercise';

export interface WorkoutSessionExercise {
  id: string;
  sourceExerciseId: string | null;
  name: string;
  muscleGroup: MuscleGroup;
  weight: number;
  reps: number;
  sets: number;
  completedSets: number;
}
