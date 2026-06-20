import type { Meta, StoryObj } from '@storybook/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { Bell, Home, MessageCircle, MoreHorizontal, Play, User } from 'lucide-react';
import type { ReactElement } from 'react';

import TabsBar from 'src/shared/ui/tabs-bar/tabs-bar';

const twoTabItems = [
  { id: 'home', label: 'Home', to: '/', icon: Home },
  { id: 'profile', label: 'Profile', to: '/profile', icon: User },
];

const fiveTabItems = [
  { id: 'home', label: 'Home', to: '/', icon: Home },
  { id: 'video', label: 'Video', to: '/video', icon: Play },
  { id: 'messages', label: 'Messages', to: '/messages', icon: MessageCircle, badgeCount: 10 },
  { id: 'notifications', label: 'Notifications', to: '/notifications', icon: Bell, badgeCount: 14 },
  { id: 'more', label: 'More', to: '/more', icon: MoreHorizontal },
];

const renderWithRouter = (activeItemId: string, items = twoTabItems): ReactElement => {
  const rootRoute = createRootRoute({
    component: (): JSX.Element => (
      <>
        <Outlet />
        <TabsBar items={items} activeItemId={activeItemId} />
      </>
    ),
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: (): null => null,
  });

  const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile',
    component: (): null => null,
  });

  const routeTree = rootRoute.addChildren([indexRoute, profileRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

  return <RouterProvider router={router} />;
};

const meta = {
  title: 'Shared/TabsBar',
  component: TabsBar,
  args: {
    items: twoTabItems,
    activeItemId: 'home',
  },
} satisfies Meta<typeof TabsBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoTabsHomeActive: Story = {
  render: (): ReactElement => renderWithRouter('home'),
};

export const TwoTabsProfileActive: Story = {
  render: (): ReactElement => renderWithRouter('profile'),
};

export const FiveTabsReference: Story = {
  render: (): ReactElement => renderWithRouter('home', fiveTabItems),
};
