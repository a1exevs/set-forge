import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { screen } from '@testing-library/react';

import { renderApp } from 'src/app/model/specs/test-utils';
import { routeTree } from 'src/route-tree.gen';

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
      completedSets: 0,
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  lastUsedAt: null,
};

describe('EditWorkoutPage', () => {
  beforeEach((): void => {
    localStorage.clear();
  });

  it('matches snapshot when list not found', async () => {
    const testRouter = createRouter({
      routeTree,
      defaultPreload: 'intent',
      history: createMemoryHistory({ initialEntries: ['/edit/non-existent-id'] }),
    });
    const { container } = renderApp(testRouter);

    await screen.findByText('Workout list not found');
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot when list exists', async () => {
    localStorage.setItem('workout-lists', JSON.stringify([TEST_LIST]));
    const testRouter = createRouter({
      routeTree,
      defaultPreload: 'intent',
      history: createMemoryHistory({ initialEntries: [`/edit/${TEST_LIST_ID}`] }),
    });
    const { container } = renderApp(testRouter);

    await screen.findByRole('heading', { name: /Editing Push Day/ });
    expect(container).toMatchSnapshot();
  });
});
