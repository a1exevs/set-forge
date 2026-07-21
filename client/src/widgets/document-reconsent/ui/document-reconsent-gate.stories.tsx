import type { Meta } from '@storybook/react';
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';

import DocumentReconsentGate from 'src/widgets/document-reconsent/ui/document-reconsent-gate';

const storyTitle = 'Widgets/DocumentReconsentGate';

const meta = {
  title: storyTitle,
  component: DocumentReconsentGate,
} satisfies Meta<typeof DocumentReconsentGate>;

export default meta;

// The gate renders TanStack Router <Link>s, so it needs a RouterProvider.
const renderGateWithRouter = (): ReactElement => {
  const rootRoute = createRootRoute({
    component: (): ReactElement => (
      <DocumentReconsentGate
        open
        busy={false}
        isError={false}
        consent={false}
        termsAccepted={false}
        onConsentChange={(): void => undefined}
        onTermsChange={(): void => undefined}
        onAccept={(): void => undefined}
        onLogout={(): void => undefined}
      />
    ),
  });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  return <RouterProvider router={router} />;
};

export const Desktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderGateWithRouter });
export const Desktop = buildDesktopStoryObj<typeof meta>({ render: renderGateWithRouter });
export const Tablet = buildTabletStoryObj<typeof meta>({ render: renderGateWithRouter });
export const Mobile = buildMobileStoryObj<typeof meta>({ render: renderGateWithRouter });
