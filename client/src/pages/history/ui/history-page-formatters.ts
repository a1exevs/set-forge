import type { WorkoutSession } from '@entities';

export const formatSessionDate = (iso: string | null): string => {
  if (!iso) {
    return '';
  }
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const countCompletedExercises = (session: WorkoutSession): number =>
  session.exercises.filter(exercise => exercise.sets > 0 && exercise.completedSets >= exercise.sets).length;

export const formatDuration = (session: WorkoutSession): string | null => {
  if (!session.finishedAt) {
    return null;
  }
  const ms = new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime();
  if (!Number.isFinite(ms) || ms <= 0) {
    return null;
  }
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
};

export const formatSummary = (session: WorkoutSession): string => {
  const total = session.exercises.length;
  const completed = countCompletedExercises(session);
  const exercisesLabel = `${completed}/${total} exercise${total === 1 ? '' : 's'}`;
  const duration = formatDuration(session);
  return duration ? `${exercisesLabel} · ${duration}` : exercisesLabel;
};
