import type { WorkoutSessionExercise } from '@entities/workout-session-exercise/@x/workout-session';

type SessionStatus = 'active' | 'completed';

export interface WorkoutSession {
  id: string;
  workoutListId: string | null;
  workoutListName: string;
  status: SessionStatus;
  startedAt: string;
  finishedAt: string | null;
  exercises: WorkoutSessionExercise[];
}

export interface WorkoutHistoryPage {
  items: WorkoutSession[];
  total: number;
  hasMore: boolean;
}
