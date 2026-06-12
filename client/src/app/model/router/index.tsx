import { createRouter } from '@tanstack/react-router';

import { queryClient } from 'src/app/model/query-client';
import { routeTree } from 'src/route-tree.gen';

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
