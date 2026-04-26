import type { Meta } from '@storybook/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import type { ReactElement } from 'react';

import { NotFoundMessage } from '@widgets';
import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';

const storyTitle = 'Widgets/NotFoundMessage';

const meta = {
  title: storyTitle,
  component: NotFoundMessage,
  argTypes: {
    title: { control: 'text' },
    backToLink: { control: 'text' },
    backToLabel: { control: 'text' },
  },
} satisfies Meta<typeof NotFoundMessage>;

export default meta;

const renderWithRouter = (title: string, backToLink?: string, backToLabel?: string): ReactElement => {
  const rootRoute = createRootRoute({
    component: (): JSX.Element => <Outlet />,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: (): JSX.Element => <NotFoundMessage title={title} backToLink={backToLink} backToLabel={backToLabel} />,
  });

  const routeTree = rootRoute.addChildren([indexRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

  return <RouterProvider router={router} />;
};

export const DefaultDesktop4k = buildDesktop4KStoryObj<typeof meta>({
  render: () => renderWithRouter('Workout list not found'),
});

export const DefaultDesktop = buildDesktopStoryObj<typeof meta>({
  render: () => renderWithRouter('Workout list not found'),
});

export const DefaultTablet = buildTabletStoryObj<typeof meta>({
  render: () => renderWithRouter('Workout list not found'),
});

export const DefaultMobile = buildMobileStoryObj<typeof meta>({
  render: () => renderWithRouter('Workout list not found'),
});

export const CustomBackToDesktop4k = buildDesktop4KStoryObj<typeof meta>({
  render: () => renderWithRouter('Workout list not found', '/custom'),
});

export const CustomBackToDesktop = buildDesktopStoryObj<typeof meta>({
  render: () => renderWithRouter('Workout list not found', '/custom'),
});

export const CustomBackToTablet = buildTabletStoryObj<typeof meta>({
  render: () => renderWithRouter('Workout list not found', '/custom'),
});

export const CustomBackToMobile = buildMobileStoryObj<typeof meta>({
  render: () => renderWithRouter('Workout list not found', '/custom'),
});
