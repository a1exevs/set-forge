import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { screen } from '@testing-library/react';

import { renderApp } from 'src/app/model/specs/test-utils';
import { routeTree } from 'src/route-tree.gen';

describe('App', () => {
  describe('Routing', () => {
    it('renders HomePage at / with expected content', async () => {
      const testRouter = createRouter({
        routeTree,
        defaultPreload: 'intent',
        history: createMemoryHistory({ initialEntries: ['/'] }),
      });
      renderApp(testRouter);

      const heading = await screen.findByText('Set Forge');
      expect(heading).toBeInTheDocument();

      const createLink = screen.getByRole('link', { name: /Create Workout List/i });
      expect(createLink).toBeInTheDocument();
    });

    it('renders CreateWorkoutPage at /create with expected content', async () => {
      const testRouter = createRouter({
        routeTree,
        defaultPreload: 'intent',
        history: createMemoryHistory({ initialEntries: ['/create'] }),
      });
      renderApp(testRouter);

      const heading = await screen.findByText('New Workout List');
      expect(heading).toBeInTheDocument();
    });

    it('renders WorkoutModePage at /workout/:id', async () => {
      const testRouter = createRouter({
        routeTree,
        defaultPreload: 'intent',
        history: createMemoryHistory({ initialEntries: ['/workout/non-existent-id'] }),
      });
      renderApp(testRouter);

      const notFoundHeading = await screen.findByText('Workout list not found');
      expect(notFoundHeading).toBeInTheDocument();
    });
  });
});
