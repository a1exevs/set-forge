export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';

export interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  weight: number;
  reps: number;
  sets: number;
}

export type UpdateExerciseDto = Omit<WorkoutExercise, 'id'> & Partial<Pick<WorkoutExercise, 'id'>>;
