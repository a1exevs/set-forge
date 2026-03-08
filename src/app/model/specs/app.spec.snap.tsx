import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { screen } from '@testing-library/react';

import { renderApp } from 'src/app/model/specs/test-utils';
import { routeTree } from 'src/route-tree.gen';


describe('App', () => {
  describe(`Page with route /`, () => {
    it(`matches snapshot, route /`, async () => {
      const testRouter = createRouter({
        routeTree,
        defaultPreload: 'intent',
        history: createMemoryHistory({ initialEntries: ['/'] }),
      });
      const { container } = renderApp(testRouter);
      await screen.findByText('Set Forge');
      expect(container).toMatchSnapshot();
    });
    it(`matches snapshot, route /create`, async () => {
      const testRouter = createRouter({
        routeTree,
        defaultPreload: 'intent',
        history: createMemoryHistory({ initialEntries: ['/create'] }),
      });
      const { container } = renderApp(testRouter);
      await screen.findByText('New Workout List');
      expect(container).toMatchSnapshot();
    });
  });
});
