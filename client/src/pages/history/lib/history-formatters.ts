import { countCompletedExercises, type WorkoutSession } from '@entities/workout-session';
import { formatDate, type Language, type Translate } from '@shared/lib';

const WITH_YEAR: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };

export const formatSessionDate = (iso: string | null, language: Language): string => {
  if (!iso) {
    return '';
  }
  return formatDate(iso, language, WITH_YEAR);
};

export const formatDuration = (session: WorkoutSession, t: Translate): string | null => {
  if (!session.finishedAt) {
    return null;
  }
  const ms = new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime();
  if (!Number.isFinite(ms) || ms <= 0) {
    return null;
  }
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes < 60) {
    return t('history.duration.minutes', { minutes: totalMinutes });
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0
    ? t('history.duration.hours', { hours })
    : t('history.duration.hoursMinutes', { hours, minutes });
};

export const formatSummary = (session: WorkoutSession, t: Translate): string => {
  const exercisesLabel = t('history.summary', {
    completed: countCompletedExercises(session),
    count: session.exercises.length,
  });
  const duration = formatDuration(session, t);
  return duration ? `${exercisesLabel} · ${duration}` : exercisesLabel;
};
