import { createRouter } from '@tanstack/react-router';

import { routeTree } from './route-tree.gen';
import { queryClient } from '../api/query-client';

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
