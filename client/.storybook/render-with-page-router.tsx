import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import type { ReactElement } from 'react';

import { ConfirmDialogProvider } from '@shared';

const PlaceholderPage = (): ReactElement => <div />;

type RenderWithPageRouterOptions = {
  component: () => ReactElement;
  initialEntries: string[];
};

export function renderWithPageRouter({ component, initialEntries }: RenderWithPageRouterOptions): ReactElement {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const rootRoute = createRootRoute({
    component: (): ReactElement => <Outlet />,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component,
  });

  const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile',
    component,
  });

  const historyRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/history',
    component,
  });

  const createRouteNode = createRoute({
    getParentRoute: () => rootRoute,
    path: '/create',
    component,
  });

  const editRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/edit/$id',
    component,
  });

  const workoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/workout/$id',
    component: PlaceholderPage,
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    profileRoute,
    historyRoute,
    createRouteNode,
    editRoute,
    workoutRoute,
  ]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ConfirmDialogProvider>
        <RouterProvider router={router} />
      </ConfirmDialogProvider>
    </QueryClientProvider>
  );
}

export function renderWithAuthRouter({ component, initialEntries }: RenderWithPageRouterOptions): ReactElement {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const rootRoute = createRootRoute({
    component: (): ReactElement => <Outlet />,
  });

  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component,
  });

  const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/register',
    component,
  });

  const routeTree = rootRoute.addChildren([loginRoute, registerRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
  });

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
