import type { WorkoutSessionExercise } from './workout-session-exercise';

type ExerciseSets = Pick<WorkoutSessionExercise, 'sets' | 'completedSets'>;

/**
 * An exercise is complete once every planned set is done. `>=`, as on the server: after the list is edited during a
 * session, `completedSets` may exceed a reduced `sets`. An exercise without sets is never complete.
 */
export const isExerciseComplete = (exercise: ExerciseSets): boolean =>
  exercise.sets > 0 && exercise.completedSets >= exercise.sets;

/** Whether another set can still be logged (the same guard the server applies to a progress increment). */
export const hasRemainingSets = (exercise: ExerciseSets): boolean => exercise.completedSets < exercise.sets;

/** Completed share of the planned sets, 0–100. */
export const getExerciseProgress = (exercise: ExerciseSets): number =>
  exercise.sets > 0 ? Math.min((exercise.completedSets / exercise.sets) * 100, 100) : 0;
