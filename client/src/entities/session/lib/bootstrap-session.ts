import type { QueryClient } from '@tanstack/react-query';

import { fetchCurrentUser } from 'src/entities/session/api/session-api';
import type { CurrentUser } from 'src/entities/session/api/session-api';
import { sessionQueryKeys } from 'src/entities/session/model/session-keys';
import { clearAccessToken, getAccessToken } from 'src/shared/api/access-token.store';
import { refreshAccessToken } from 'src/shared/api/refresh-access-token';

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
    queryClient.removeQueries({ queryKey: sessionQueryKeys.me });
    return null;
  }

  queryClient.setQueryData(sessionQueryKeys.me, user);
  return user;
}
