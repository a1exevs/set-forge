import { screen } from '@testing-library/react';

import { createTestQueryClient, createTestRouter, renderApp } from 'src/app/model/specs/test-utils';
import { fetchWorkoutList } from 'src/entities/workout-list/api';

jest.mock('src/entities/workout-list/api', () => ({
  fetchWorkoutLists: jest.fn().mockResolvedValue([]),
  fetchWorkoutList: jest.fn(),
  createWorkoutList: jest.fn(),
  updateWorkoutList: jest.fn(),
  deleteWorkoutList: jest.fn(),
}));

jest.mock('src/entities/workout-session/api', () => ({
  fetchActiveWorkoutSession: jest.fn().mockResolvedValue(null),
  startWorkoutSession: jest.fn(),
  fetchWorkoutSession: jest.fn(),
  incrementSessionProgress: jest.fn(),
  finishWorkoutSession: jest.fn(),
  resyncWorkoutSession: jest.fn(),
}));

const TEST_LIST_ID = 'test-list-1';
const TEST_LIST = {
  id: TEST_LIST_ID,
  name: 'Push Day',
  description: 'Chest focus',
  exercises: [
    {
      id: 'ex-1',
      name: 'Bench Press',
      muscleGroup: 'chest' as const,
      weight: 80,
      reps: 10,
      sets: 3,
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  lastUsedAt: null,
};

describe('EditWorkoutPage', () => {
  beforeEach((): void => {
    jest.clearAllMocks();
  });

  it('matches snapshot when list not found', async () => {
    (fetchWorkoutList as jest.Mock).mockResolvedValue(null);
    const queryClient = createTestQueryClient();
    const testRouter = createTestRouter('/edit/non-existent-id', queryClient);
    const { container } = renderApp(testRouter, queryClient);

    await screen.findByText('Workout list not found');
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot when list exists', async () => {
    (fetchWorkoutList as jest.Mock).mockResolvedValue(TEST_LIST);
    const queryClient = createTestQueryClient();
    const testRouter = createTestRouter(`/edit/${TEST_LIST_ID}`, queryClient);
    const { container } = renderApp(testRouter, queryClient);

    await screen.findByRole('heading', { name: /Editing Push Day/ });
    expect(container).toMatchSnapshot();
  });
});
