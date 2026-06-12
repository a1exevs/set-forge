import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createTestQueryClient, createTestRouter, renderApp } from 'src/app/model/specs/test-utils';
import { fetchWorkoutList, updateWorkoutList } from 'src/entities/workout-list/api';

jest.mock('src/entities/workout-list/api', () => ({
  fetchWorkoutLists: jest.fn().mockResolvedValue([]),
  fetchWorkoutList: jest.fn(),
  createWorkoutList: jest.fn(),
  updateWorkoutList: jest.fn(),
  deleteWorkoutList: jest.fn(),
  incrementExerciseProgress: jest.fn(),
  resetWorkoutProgress: jest.fn(),
}));

const TEST_LIST_ID = 'test-list-1';
const TEST_LIST = {
  id: TEST_LIST_ID,
  name: 'Push Day',
  description: 'Chest, shoulders',
  exercises: [
    {
      id: 'ex-1',
      name: 'Bench Press',
      muscleGroup: 'chest' as const,
      weight: 80,
      reps: 10,
      sets: 3,
      completedSets: 0,
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  lastUsedAt: null,
};

describe('EditWorkoutPage', () => {
  beforeEach((): void => {
    jest.clearAllMocks();
    (fetchWorkoutList as jest.Mock).mockResolvedValue(TEST_LIST);
    (updateWorkoutList as jest.Mock).mockResolvedValue(TEST_LIST);
  });

  describe('rendering', () => {
    it('renders NotFoundMessage when id does not exist', async () => {
      (fetchWorkoutList as jest.Mock).mockResolvedValue(null);
      const queryClient = createTestQueryClient();
      const testRouter = createTestRouter('/edit/non-existent-id', queryClient);
      renderApp(testRouter, queryClient);

      const heading = await screen.findByText('Workout list not found');
      expect(heading).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Back to Home' })).toBeInTheDocument();
    });

    it('renders WorkoutListForm when list exists', async () => {
      const queryClient = createTestQueryClient();
      const testRouter = createTestRouter(`/edit/${TEST_LIST_ID}`, queryClient);
      renderApp(testRouter, queryClient);

      const heading = await screen.findByRole('heading', { name: /Editing Push Day/ });
      expect(heading).toBeInTheDocument();
      expect(screen.getByDisplayValue('Push Day')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('navigates to home when Cancel is clicked', async () => {
      const queryClient = createTestQueryClient();
      const testRouter = createTestRouter(`/edit/${TEST_LIST_ID}`, queryClient);
      renderApp(testRouter, queryClient);

      const cancelButton = await screen.findByRole('button', { name: 'Cancel' });
      const user = userEvent.setup();
      await user.click(cancelButton);

      expect(await screen.findByText('Set Forge')).toBeInTheDocument();
    });
  });
});
