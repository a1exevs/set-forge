import { screen } from '@testing-library/react';

import { createTestQueryClient, createTestRouter, renderApp } from 'src/app/model/specs/test-utils';

describe('App', () => {
  describe('Routing', () => {
    it('renders HomePage at / with expected content', async () => {
      const queryClient = createTestQueryClient();
      const testRouter = createTestRouter('/', queryClient);
      renderApp(testRouter, queryClient);

      const heading = await screen.findByText('Set Forge');
      expect(heading).toBeInTheDocument();

      const createLink = screen.getByRole('link', { name: /Create Workout List/i });
      expect(createLink).toBeInTheDocument();
    });

    it('renders CreateWorkoutPage at /create with expected content', async () => {
      const queryClient = createTestQueryClient();
      const testRouter = createTestRouter('/create', queryClient);
      renderApp(testRouter, queryClient);

      const heading = await screen.findByText('New Workout List');
      expect(heading).toBeInTheDocument();
    });

    it('renders WorkoutModePage at /workout/:id', async () => {
      const queryClient = createTestQueryClient();
      const testRouter = createTestRouter('/workout/non-existent-id', queryClient);
      renderApp(testRouter, queryClient);

      const notFoundHeading = await screen.findByText('Workout list not found');
      expect(notFoundHeading).toBeInTheDocument();
    });

    it('renders EditWorkoutPage at /edit/:id with NotFoundMessage when id does not exist', async () => {
      const queryClient = createTestQueryClient();
      const testRouter = createTestRouter('/edit/non-existent-id', queryClient);
      renderApp(testRouter, queryClient);

      const notFoundHeading = await screen.findByText('Workout list not found');
      expect(notFoundHeading).toBeInTheDocument();
    });
  });
});
