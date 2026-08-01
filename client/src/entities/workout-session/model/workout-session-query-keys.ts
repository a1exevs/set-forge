export const workoutSessionQueryKeys = {
  all: ['workout-sessions'] as const,
  detail: (id: string) => ['workout-sessions', id] as const,
  forList: (workoutListId: string) => ['workout-sessions', 'for-list', workoutListId] as const,
  active: (workoutListId: string) => ['workout-sessions', 'active', workoutListId] as const,
  historyRoot: ['workout-sessions', 'history'] as const,
  history: (pageSize: number) => ['workout-sessions', 'history', pageSize] as const,
};
