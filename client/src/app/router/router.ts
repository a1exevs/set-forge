import type { QueryClient } from '@tanstack/react-query';
import { createRouter, type RouterHistory } from '@tanstack/react-router';

import { routeTree } from './route-tree.gen';
import { queryClient } from '../api/query-client';

/**
 * The app router — one factory for the app and its tests, so a test runs the production configuration.
 * No `defaultPreload`: link intent must not run the route lifecycle (session/bootstrap-once).
 */
export const createAppRouter = (
  client: QueryClient,
  history?: RouterHistory,
): ReturnType<typeof createRouter<typeof routeTree>> =>
  createRouter({
    routeTree,
    context: {
      queryClient: client,
    },
    history,
  });

export const router = createAppRouter(queryClient);

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
