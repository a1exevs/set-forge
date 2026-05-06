import { screen } from '@testing-library/react';

import { createTestQueryClient, createTestRouter, renderApp } from 'src/app/model/specs/test-utils';

describe('App', () => {
  describe(`Page with route /`, () => {
    it(`matches snapshot, route /`, async () => {
      const queryClient = createTestQueryClient();
      const testRouter = createTestRouter('/', queryClient);
      const { container } = renderApp(testRouter, queryClient);
      await screen.findByText('Set Forge');
      expect(container).toMatchSnapshot();
    });
    it(`matches snapshot, route /create`, async () => {
      const queryClient = createTestQueryClient();
      const testRouter = createTestRouter('/create', queryClient);
      const { container } = renderApp(testRouter, queryClient);
      await screen.findByText('New Workout List');
      expect(container).toMatchSnapshot();
    });
  });
});
