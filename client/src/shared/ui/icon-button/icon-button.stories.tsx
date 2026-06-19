import type { Meta, StoryObj } from '@storybook/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { Download, Plus } from 'lucide-react';
import type { ReactElement } from 'react';

import IconButton from 'src/shared/ui/icon-button/icon-button';

const meta = {
  title: 'Shared/IconButton',
  component: IconButton,
  args: {
    'aria-label': 'Action',
    children: <Download size={18} strokeWidth={1.75} aria-hidden />,
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ghost: Story = { args: { variant: 'ghost' } };
export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: <Plus size={24} strokeWidth={2} aria-hidden />,
    'aria-label': 'Create workout list',
    title: 'Create workout list',
  },
};
export const Large: Story = { args: { size: 'lg' } };
export const Disabled: Story = { args: { disabled: true } };
export const WithTitle: Story = {
  args: {
    title: 'Export workout lists',
    'aria-label': 'Export workout lists',
  },
};

const renderAsLink = (): ReactElement => {
  const rootRoute = createRootRoute({
    component: (): JSX.Element => <Outlet />,
  });

  const createRouteNode = createRoute({
    getParentRoute: () => rootRoute,
    path: '/create',
    component: (): null => null,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: (): JSX.Element => (
      <IconButton
        as={Link}
        to="/create"
        variant="primary"
        size="lg"
        aria-label="Create workout list"
        title="Create workout list"
      >
        <Plus size={24} strokeWidth={2} aria-hidden />
      </IconButton>
    ),
  });

  const routeTree = rootRoute.addChildren([indexRoute, createRouteNode]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

  return <RouterProvider router={router} />;
};

export const AsLink: Story = {
  render: renderAsLink,
};
