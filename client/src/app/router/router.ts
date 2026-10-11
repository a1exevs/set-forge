import type { QueryClient } from '@tanstack/react-query';
import { createRouter, type RouterHistory } from '@tanstack/react-router';

import { routeTree } from './route-tree.gen';
import { queryClient } from '../api/query-client';

/**
 * The app router. One factory for the app and its tests, so a test exercises the production configuration
 * (`createTestRouter` in `specs/test-utils.tsx` passes a memory history).
 *
 * No `defaultPreload`: hovering or touching a link must not run the route lifecycle — no route has a loader, so an
 * intent preload only ran the root session check (`routes/__root.tsx`). Data prefetch on intent is a separate task.
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
