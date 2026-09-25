import type { QueryClient } from '@tanstack/react-query';

import { clearAccessToken, getAccessToken, refreshAccessToken } from '@shared/api';

import { sessionQueryKeys } from './session-keys';
import { type CurrentUser, fetchCurrentUser } from '../api/session-api';

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
