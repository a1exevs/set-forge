import type { MuscleGroup } from '@entities';

export type SessionStatus = 'active' | 'completed';

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

export interface WorkoutSession {
  id: string;
  workoutListId: string | null;
  workoutListName: string;
  status: SessionStatus;
  startedAt: string;
  finishedAt: string | null;
  exercises: WorkoutSessionExercise[];
}
