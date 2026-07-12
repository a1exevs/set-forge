import type { WorkoutSession } from '@entities';

export const mockWorkoutSession: WorkoutSession = {
  id: 'sess-1',
  workoutListId: 'list-1',
  workoutListName: 'Push Day',
  status: 'completed',
  startedAt: '2026-06-05T09:00:00.000Z',
  finishedAt: '2026-06-05T09:52:00.000Z',
  exercises: [
    {
      id: 'ex-1',
      sourceExerciseId: 'tpl-1',
      name: 'Bench Press',
      muscleGroup: 'chest',
      weight: 60,
      reps: 10,
      sets: 3,
      completedSets: 3,
    },
    {
      id: 'ex-2',
      sourceExerciseId: 'tpl-2',
      name: 'Overhead Press',
      muscleGroup: 'shoulders',
      weight: 35,
      reps: 8,
      sets: 3,
      completedSets: 2,
    },
  ],
};

export const mockWorkoutSessions: WorkoutSession[] = [
  mockWorkoutSession,
  {
    id: 'sess-2',
    workoutListId: 'list-2',
    workoutListName: 'Leg Day',
    status: 'completed',
    startedAt: '2026-06-03T18:00:00.000Z',
    finishedAt: '2026-06-03T19:05:00.000Z',
    exercises: [
      {
        id: 'ex-3',
        sourceExerciseId: 'tpl-3',
        name: 'Squat',
        muscleGroup: 'legs',
        weight: 100,
        reps: 5,
        sets: 5,
        completedSets: 5,
      },
    ],
  },
];
