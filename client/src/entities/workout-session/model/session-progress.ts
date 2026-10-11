import { isExerciseComplete } from '@entities/workout-session-exercise/@x/workout-session';

import type { WorkoutSession } from './workout-session';

/** Number of exercises of the session with every planned set done. */
export const countCompletedExercises = (session: WorkoutSession): number =>
  session.exercises.filter(isExerciseComplete).length;

/** A session is fully complete when it has exercises and all of them are complete. */
export const isSessionFullyComplete = (session: WorkoutSession): boolean =>
  session.exercises.length > 0 && session.exercises.every(isExerciseComplete);
