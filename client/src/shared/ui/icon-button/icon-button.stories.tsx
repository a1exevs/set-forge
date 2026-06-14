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
import type { ReactElement } from 'react';

import IconButton from 'src/shared/ui/icon-button/icon-button';

const IconPlus = (): JSX.Element => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconDownload = (): JSX.Element => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M12 3v10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <path d="M8 9l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const meta = {
  title: 'Shared/IconButton',
  component: IconButton,
  args: {
    'aria-label': 'Action',
    children: <IconDownload />,
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ghost: Story = { args: { variant: 'ghost' } };
export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: <IconPlus />,
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
        <IconPlus />
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
