import { screen } from '@testing-library/react';

import { createTestQueryClient, createTestRouter, renderApp } from 'src/app/model/specs/test-utils';

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
    const queryClient = createTestQueryClient();
    const testRouter = createTestRouter('/edit/non-existent-id', queryClient);
    const { container } = renderApp(testRouter, queryClient);

    await screen.findByText('Workout list not found');
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot when list exists', async () => {
    localStorage.setItem('workout-lists', JSON.stringify([TEST_LIST]));
    const queryClient = createTestQueryClient();
    const testRouter = createTestRouter(`/edit/${TEST_LIST_ID}`, queryClient);
    const { container } = renderApp(testRouter, queryClient);

    await screen.findByRole('heading', { name: /Editing Push Day/ });
    expect(container).toMatchSnapshot();
  });
});
