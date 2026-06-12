import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type AnyRouter, createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render } from '@testing-library/react';

import { ConfirmDialogProvider } from '@shared';

import { routeTree } from 'src/route-tree.gen';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function createTestRouter(initialEntry: string, queryClient: QueryClient): AnyRouter {
  return createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
    defaultPreload: 'intent',
  });
}

export const renderApp = (router: AnyRouter, queryClient: QueryClient): ReturnType<typeof render> =>
  render(
    <QueryClientProvider client={queryClient}>
      <ConfirmDialogProvider>
        <RouterProvider router={router} context={{ queryClient }} />
      </ConfirmDialogProvider>
    </QueryClientProvider>,
  );
