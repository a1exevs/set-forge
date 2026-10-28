import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet, redirect } from '@tanstack/react-router';

import { bootstrapSessionAndPrimeCache, getCachedCurrentUser } from '@entities/session';
import { createSingleFlight } from '@shared/lib';
import { DocumentReconsentGate } from '@widgets/document-reconsent';

// Guest-only pages: a signed-in user has no reason to see the auth forms, so send them home.
const GUEST_ONLY_PATHS = new Set(['/login', '/register']);
// Always-public pages: readable by everyone (signed-in or not) with no redirect and no auth gate.
const ALWAYS_PUBLIC_PATHS = new Set(['/privacy', '/terms']);

const buildRedirectTarget = (pathname: string, search: unknown): string => {
  if (typeof search === 'string') {
    return `${pathname}${search}`;
  }

  if (search && typeof search === 'object') {
    const params = new URLSearchParams();
    Object.entries(search as Record<string, unknown>).forEach(([key, value]) => {
      if (typeof value === 'string') {
        params.set(key, value);
      }
    });
    const serialized = params.toString();
    return serialized.length > 0 ? `${pathname}?${serialized}` : pathname;
  }

  return pathname;
};

// The router may run `beforeLoad` again while the first bootstrap is pending: those runs share it, and later
// navigations read the cached user (session/bootstrap-once).
type SessionUser = Awaited<ReturnType<typeof bootstrapSessionAndPrimeCache>>;

const sharedBootstrap = createSingleFlight(bootstrapSessionAndPrimeCache);

const resolveSessionUser = (queryClient: QueryClient): SessionUser | Promise<SessionUser> =>
  getCachedCurrentUser(queryClient) ?? sharedBootstrap(queryClient);

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ context, location }) => {
    const path = location.pathname;

    // Legal documents are open to everyone, without a bootstrap: a user with pending re-acceptance still reads them
    // (session/route-guards, session/reconsent-gate).
    if (ALWAYS_PUBLIC_PATHS.has(path)) {
      return;
    }

    if (GUEST_ONLY_PATHS.has(path)) {
      if (getCachedCurrentUser(context.queryClient)) {
        throw redirect({ to: '/' });
      }
      return;
    }

    const user = await resolveSessionUser(context.queryClient);

    if (!user) {
      throw redirect({
        to: '/login',
        search: { redirect: buildRedirectTarget(location.pathname, location.search) },
      });
    }
  },
  component: (): JSX.Element => (
    <>
      <Outlet />
      <DocumentReconsentGate />
    </>
  ),
});
