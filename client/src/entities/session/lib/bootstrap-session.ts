import type { QueryClient } from '@tanstack/react-query';

import { clearAccessToken, getAccessToken, refreshAccessToken } from '@shared';

import { fetchCurrentUser } from 'src/entities/session/api/session-api';
import type { CurrentUser } from 'src/entities/session/api/session-api';
import { sessionQueryKeys } from 'src/entities/session/model/session-keys';

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
