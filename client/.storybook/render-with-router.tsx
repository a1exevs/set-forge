import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import type { ReactElement } from 'react';

type RenderWithRouterOptions = {
  /** Rendered as the root route, so it stays mounted while a `Link` inside it navigates. */
  component: () => ReactElement;
  /** Targets of the links in the component; each becomes an empty route so navigation resolves. */
  paths?: string[];
  initialEntry?: string;
};

const PlaceholderPage = (): null => null;

/**
 * A memory router around a `shared` component that renders TanStack `Link`s (TabsBar, NotFoundMessage,
 * IconButton as a link). Pages go through `renderWithPageRouter`, which also provides the query client.
 */
export function renderWithRouter({
  component,
  paths = ['/'],
  initialEntry = '/',
}: RenderWithRouterOptions): ReactElement {
  const rootRoute = createRootRoute({ component });
  const routes = [...new Set([initialEntry, ...paths])].map(path =>
    createRoute({ getParentRoute: () => rootRoute, path, component: PlaceholderPage }),
  );
  const router = createRouter({
    routeTree: rootRoute.addChildren(routes),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });

  return <RouterProvider router={router} />;
}
