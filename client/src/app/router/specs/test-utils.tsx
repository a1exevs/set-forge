import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type AnyRouter, createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { render } from '@testing-library/react';

import { ConfirmDialogProvider } from '@shared/ui';

import { createAppRouter } from '../router';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

/** The production router (same factory, same options) on a memory history starting at `initialEntry`. */
export function createTestRouter(initialEntry: string, queryClient: QueryClient): AnyRouter {
  return createAppRouter(queryClient, createMemoryHistory({ initialEntries: [initialEntry] }));
}

export const renderApp = (router: AnyRouter, queryClient: QueryClient): ReturnType<typeof render> =>
  render(
    <QueryClientProvider client={queryClient}>
      <ConfirmDialogProvider>
        <RouterProvider router={router} context={{ queryClient }} />
      </ConfirmDialogProvider>
    </QueryClientProvider>,
  );
