import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet, redirect } from '@tanstack/react-router';
import { FC, useEffect } from 'react';

import { useWorkoutListStore } from '@entities';

import type { CurrentUser } from 'src/entities/session/api/session-api';
import { bootstrapSessionAndPrimeCache } from 'src/entities/session/lib/bootstrap-session';
import { sessionQueryKeys } from 'src/entities/session/model/session-keys';

const PUBLIC_PATHS = new Set(['/login', '/register']);

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

const RootComponent: FC = () => {
  const loadFromStorage = useWorkoutListStore.use.loadFromStorage();
  const workoutLists = useWorkoutListStore.use.workoutLists();

  useEffect((): void => {
    if (workoutLists.length === 0) {
      loadFromStorage();
    }
  }, [loadFromStorage, workoutLists.length]);

  return <Outlet />;
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ context, location }) => {
    const path = location.pathname;
    const isPublic = PUBLIC_PATHS.has(path);
    if (isPublic) {
      const cachedUser = context.queryClient.getQueryData<CurrentUser | null>(sessionQueryKeys.me) ?? null;
      if (cachedUser) {
        throw redirect({ to: '/' });
      }
      return;
    }

    await bootstrapSessionAndPrimeCache(context.queryClient);
    const user = context.queryClient.getQueryData<CurrentUser | null>(sessionQueryKeys.me) ?? null;

    if (!user) {
      throw redirect({
        to: '/login',
        search: { redirect: buildRedirectTarget(location.pathname, location.search) },
      });
    }
  },
  component: RootComponent,
});
