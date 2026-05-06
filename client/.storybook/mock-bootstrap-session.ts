import type { QueryClient } from '@tanstack/react-query';

import type { CurrentUser } from 'src/entities/session/api/session-api';
import { sessionQueryKeys } from 'src/entities/session/model/session-keys';

/** Storybook stub: skip real API session bootstrap. */
export async function bootstrapSessionAndPrimeCache(queryClient: QueryClient): Promise<CurrentUser | null> {
  const user: CurrentUser = { id: 1, email: 'storybook@example.com' };
  queryClient.setQueryData(sessionQueryKeys.me, user);
  return user;
}
