import { useNavigate } from '@tanstack/react-router';

import { useClearSessionCache, useLogoutMutation } from '@entities/session';

type Logout = {
  /** Signs the user out; never rejects — the local session is gone anyway. */
  logout: () => Promise<void>;
  /**
   * Ends the session on this device — clears every cached query — and goes to /login: the caller's next step after
   * `logout` or account deletion, also when the request failed.
   */
  leave: () => void;
};

/** Signing out in two steps, so the caller holds the button's progress between the request and leaving for /login. */
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
      // Before the navigation: a cached user would send /login back home
      clearSessionCache();
      void navigate({ to: '/login' });
    },
  };
}
