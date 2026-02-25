import type { MuscleGroup } from '@entities';

export interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  weight: number;
  reps: number;
  sets: number;
  completedSets: number;
}

export interface WorkoutList {
  id: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  createdAt: string;
  lastUsedAt: string | null;
}

export interface CreateWorkoutListDto {
  name: string;
  description: string;
  exercises: Omit<WorkoutExercise, 'id' | 'completedSets'>[];
}

export interface UpdateWorkoutListDto {
  name?: string;
  description?: string;
  exercises?: WorkoutExercise[];
  lastUsedAt?: string | null;
}
