import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';

import { routeTree } from 'src/route-tree.gen';

describe('App', () => {
  describe(`Page with route /`, () => {
    it(`matches snapshot, route /`, async () => {
      const testRouter = createRouter({
        routeTree,
        defaultPreload: 'intent',
        history: createMemoryHistory({ initialEntries: ['/'] }),
      });
      const { container } = render(<RouterProvider router={testRouter} />);
      await screen.findByText('Set Forge');
      expect(container).toMatchSnapshot();
    });
    it(`matches snapshot, route /create`, async () => {
      const testRouter = createRouter({
        routeTree,
        defaultPreload: 'intent',
        history: createMemoryHistory({ initialEntries: ['/create'] }),
      });
      const { container } = render(<RouterProvider router={testRouter} />);
      await screen.findByText('New Workout List');
      expect(container).toMatchSnapshot();
    });
  });
});
