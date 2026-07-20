import type { Meta } from '@storybook/react';
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';

import LegalFooter from 'src/widgets/legal-footer/ui/legal-footer';

const storyTitle = 'Widgets/LegalFooter';

const meta = {
  title: storyTitle,
  component: LegalFooter,
} satisfies Meta<typeof LegalFooter>;

export default meta;

// LegalFooter renders TanStack Router <Link>s, so it needs a RouterProvider.
const renderFooterWithRouter = (): ReactElement => {
  const rootRoute = createRootRoute({
    component: (): ReactElement => <LegalFooter />,
  });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  return <RouterProvider router={router} />;
};

export const Desktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderFooterWithRouter });
export const Desktop = buildDesktopStoryObj<typeof meta>({ render: renderFooterWithRouter });
export const Tablet = buildTabletStoryObj<typeof meta>({ render: renderFooterWithRouter });
export const Mobile = buildMobileStoryObj<typeof meta>({ render: renderFooterWithRouter });
