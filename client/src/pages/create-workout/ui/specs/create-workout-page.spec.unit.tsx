import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createTestQueryClient, createTestRouter, renderApp } from 'src/app/model/specs/test-utils';
import { createWorkoutList } from 'src/entities/workout-list/api';

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
  incrementSessionProgress: jest.fn(),
  finishWorkoutSession: jest.fn(),
  resyncWorkoutSession: jest.fn(),
}));

const CREATED_LIST = {
  id: 'list-1',
  name: 'Push Day',
  description: 'Chest',
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

describe('CreateWorkoutPage', () => {
  beforeEach((): void => {
    jest.clearAllMocks();
    (createWorkoutList as jest.Mock).mockResolvedValue(CREATED_LIST);
  });

  describe('rendering', () => {
    it('renders WorkoutListForm in create mode', async () => {
      const queryClient = createTestQueryClient();
      const testRouter = createTestRouter('/create', queryClient);
      renderApp(testRouter, queryClient);

      const heading = await screen.findByText('New Workout List');
      expect(heading).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create List' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('navigates to home when Cancel is clicked', async () => {
      const queryClient = createTestQueryClient();
      const testRouter = createTestRouter('/create', queryClient);
      renderApp(testRouter, queryClient);

      const cancelButton = await screen.findByRole('button', { name: 'Cancel' });
      const user = userEvent.setup();
      await user.click(cancelButton);

      expect(await screen.findByText('Workout lists')).toBeInTheDocument();
    });
  });
});
