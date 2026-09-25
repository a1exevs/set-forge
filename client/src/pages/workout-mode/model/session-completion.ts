import type { WorkoutSession } from '@entities/workout-session';

export const isSessionFullyComplete = (session: WorkoutSession): boolean =>
  session.exercises.length > 0 &&
  session.exercises.every(exercise => exercise.sets > 0 && exercise.completedSets === exercise.sets);
