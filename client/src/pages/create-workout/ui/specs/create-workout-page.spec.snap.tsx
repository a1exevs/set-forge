import { screen } from '@testing-library/react';

import { createTestQueryClient, createTestRouter, renderApp } from 'src/app/model/specs/test-utils';

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

describe('CreateWorkoutPage', () => {
  it('matches snapshot', async () => {
    const queryClient = createTestQueryClient();
    const testRouter = createTestRouter('/create', queryClient);
    const { container } = renderApp(testRouter, queryClient);

    await screen.findByText('New Workout List');
    expect(container).toMatchSnapshot();
  });
});
