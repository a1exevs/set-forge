import type { QueryClient } from '@tanstack/react-query';

import { clearAccessToken, getAccessToken, refreshAccessToken } from '@shared/api';

import type { CurrentUser } from './current-user';
import { sessionQueryKeys } from './session-keys';
import { fetchCurrentUser } from '../api/session-api';

export async function bootstrapSessionAndPrimeCache(queryClient: QueryClient): Promise<CurrentUser | null> {
  if (!getAccessToken()) {
    await refreshAccessToken();
  }

  let user = await fetchCurrentUser();
  if (!user && getAccessToken()) {
    await refreshAccessToken();
    user = await fetchCurrentUser();
  }

  if (!user) {
    clearAccessToken();
    queryClient.clear();
    return null;
  }

  queryClient.setQueryData(sessionQueryKeys.me, user);
  return user;
}

/** The signed-in user already in the cache (no request); `null` when nobody is signed in or nothing is cached. */
export function getCachedCurrentUser(queryClient: QueryClient): CurrentUser | null {
  return queryClient.getQueryData<CurrentUser | null>(sessionQueryKeys.me) ?? null;
}
