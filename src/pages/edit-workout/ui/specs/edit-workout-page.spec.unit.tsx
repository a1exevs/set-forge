import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderApp } from 'src/app/model/specs/test-utils';
import { routeTree } from 'src/route-tree.gen';

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

const seedStorage = (): void => {
  localStorage.setItem('workout-lists', JSON.stringify([TEST_LIST]));
};

describe('EditWorkoutPage', () => {
  beforeEach((): void => {
    localStorage.clear();
  });

  describe('rendering', () => {
    it('renders NotFoundMessage when id does not exist', async () => {
      const testRouter = createRouter({
        routeTree,
        defaultPreload: 'intent',
        history: createMemoryHistory({ initialEntries: ['/edit/non-existent-id'] }),
      });
      renderApp(testRouter);

      const heading = await screen.findByText('Workout list not found');
      expect(heading).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Back to Home' })).toBeInTheDocument();
    });

    it('renders WorkoutListForm when list exists in storage', async () => {
      seedStorage();
      const testRouter = createRouter({
        routeTree,
        defaultPreload: 'intent',
        history: createMemoryHistory({ initialEntries: [`/edit/${TEST_LIST_ID}`] }),
      });
      renderApp(testRouter);

      const heading = await screen.findByRole('heading', { name: /Editing Push Day/ });
      expect(heading).toBeInTheDocument();
      expect(screen.getByDisplayValue('Push Day')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('navigates to home when Cancel is clicked', async () => {
      seedStorage();
      const testRouter = createRouter({
        routeTree,
        defaultPreload: 'intent',
        history: createMemoryHistory({ initialEntries: [`/edit/${TEST_LIST_ID}`] }),
      });
      renderApp(testRouter);

      const cancelButton = await screen.findByRole('button', { name: 'Cancel' });
      const user = userEvent.setup();
      await user.click(cancelButton);

      expect(await screen.findByText('Set Forge')).toBeInTheDocument();
    });
  });
});
