import type { MuscleGroup } from '@entities';

export interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  weight: number;
  reps: number;
  sets: number;
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
  exercises: Omit<WorkoutExercise, 'id'>[];
}

export type UpdateExerciseDto = Omit<WorkoutExercise, 'id'> & Partial<Pick<WorkoutExercise, 'id'>>;

export interface UpdateWorkoutListDto {
  name: string;
  description: string;
  exercises: UpdateExerciseDto[];
}

export interface WorkoutListExportItem {
  name: string;
  description: string;
  exercises: Omit<WorkoutExercise, 'id'>[];
  createdAt?: string;
  lastUsedAt?: string | null;
}

export interface WorkoutListsExportFile {
  formatVersion: 1;
  app: 'set-forge';
  exportedAt: string;
  workoutLists: WorkoutListExportItem[];
}

export interface ImportWorkoutListsResult {
  importedCount: number;
  lists: WorkoutList[];
}
