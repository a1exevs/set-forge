import type { Meta, StoryObj } from '@storybook/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import type { ReactElement } from 'react';

import MainTabsBar from 'src/widgets/main-tabs-bar/ui/main-tabs-bar';

const renderWithRouter = (initialPath: '/' | '/history' | '/profile'): ReactElement => {
  const rootRoute = createRootRoute({
    component: (): JSX.Element => (
      <>
        <Outlet />
        <MainTabsBar />
      </>
    ),
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: (): null => null,
  });

  const historyRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/history',
    component: (): null => null,
  });

  const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile',
    component: (): null => null,
  });

  const routeTree = rootRoute.addChildren([indexRoute, historyRoute, profileRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });

  return <RouterProvider router={router} />;
};

const meta = {
  title: 'Widgets/MainTabsBar',
  component: MainTabsBar,
} satisfies Meta<typeof MainTabsBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HomeActive: Story = {
  render: (): ReactElement => renderWithRouter('/'),
};

export const HistoryActive: Story = {
  render: (): ReactElement => renderWithRouter('/history'),
};

export const ProfileActive: Story = {
  render: (): ReactElement => renderWithRouter('/profile'),
};
