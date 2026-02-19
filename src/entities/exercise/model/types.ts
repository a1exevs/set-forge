export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroup: MuscleGroup;
  createdAt: string;
}

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'cardio';

export interface CreateExerciseDto {
  name: string;
  description: string;
  muscleGroup: MuscleGroup;
}
