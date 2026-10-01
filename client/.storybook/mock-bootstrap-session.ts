import type { QueryClient } from '@tanstack/react-query';

// Files, not the slice index: the index re-exports the module this stub replaces.
import type { CurrentUser } from 'src/entities/session/model/current-user';
import { sessionQueryKeys } from 'src/entities/session/model/session-keys';

/** Storybook stub: skip real API session bootstrap. */
export async function bootstrapSessionAndPrimeCache(queryClient: QueryClient): Promise<CurrentUser | null> {
  const user: CurrentUser = { id: 1, email: 'storybook@example.com', documentsPendingAcceptance: false };
  queryClient.setQueryData(sessionQueryKeys.me, user);
  return user;
}

/** Same contract as the real module: the user the stub primed, read back from the cache. */
export function getCachedCurrentUser(queryClient: QueryClient): CurrentUser | null {
  return queryClient.getQueryData<CurrentUser | null>(sessionQueryKeys.me) ?? null;
}
