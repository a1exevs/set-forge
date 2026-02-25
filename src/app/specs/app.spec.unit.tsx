import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { routeTree } from 'src/route-tree.gen';

describe('App', () => {
  describe('Routing', () => {
    it('renders HomePage at / with expected content', async () => {
      const testRouter = createRouter({
        routeTree,
        defaultPreload: 'intent',
        history: createMemoryHistory({ initialEntries: ['/'] }),
      });
      render(<RouterProvider router={testRouter} />);

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
      render(<RouterProvider router={testRouter} />);

      const heading = await screen.findByText('New Workout List');
      expect(heading).toBeInTheDocument();
    });

    it('renders WorkoutModePage at /workout/:id', async () => {
      const testRouter = createRouter({
        routeTree,
        defaultPreload: 'intent',
        history: createMemoryHistory({ initialEntries: ['/workout/non-existent-id'] }),
      });
      render(<RouterProvider router={testRouter} />);

      const notFoundHeading = await screen.findByText('Workout list not found');
      expect(notFoundHeading).toBeInTheDocument();
    });
  });
});
