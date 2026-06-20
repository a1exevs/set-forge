export const workoutQueryKeys = {
  lists: ['workout-lists'] as const,
  detail: (id: string) => ['workout-lists', id] as const,
};
