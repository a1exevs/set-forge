import { useNavigate } from '@tanstack/react-router';

import { useClearSessionCache, useLogoutMutation } from '@entities/session';

type Logout = {
  /** Signs the user out; never rejects — the local session is gone anyway. */
  logout: () => Promise<void>;
  /** Ends the session on this device: clears every cached query and goes to /login, also after a failed logout. */
  leave: () => void;
};

/** Signing out in two steps — the request, then leaving — so the caller decides when to leave. */
export function useLogout(): Logout {
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();
  const clearSessionCache = useClearSessionCache();

  return {
    logout: (): Promise<void> =>
      logoutMutation
        .mutateAsync()
        .then((): void => undefined)
        .catch((): void => undefined),
    leave: (): void => {
      // Before the navigation: `/login` is guest-only (session/route-guards), so no cached user may stay
      clearSessionCache();
      void navigate({ to: '/login' });
    },
  };
}
