import type { WorkoutList } from '@entities';

export const mockWorkoutList: WorkoutList = {
  id: 'list-1',
  name: 'Push Day',
  description: 'Chest, shoulders, triceps',
  exercises: [
    {
      id: 'ex-1',
      name: 'Bench Press',
      muscleGroup: 'chest',
      weight: 80,
      reps: 10,
      sets: 3,
    },
    {
      id: 'ex-2',
      name: 'Overhead Press',
      muscleGroup: 'shoulders',
      weight: 50,
      reps: 8,
      sets: 4,
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  lastUsedAt: null,
};

export const mockWorkoutLists: WorkoutList[] = [
  mockWorkoutList,
  {
    id: 'list-2',
    name: 'Pull Day',
    description: 'Back and biceps',
    exercises: [
      {
        id: 'ex-3',
        name: 'Deadlift',
        muscleGroup: 'back',
        weight: 120,
        reps: 5,
        sets: 3,
      },
    ],
    createdAt: '2024-01-15T00:00:00Z',
    lastUsedAt: '2024-02-01T00:00:00Z',
  },
];
