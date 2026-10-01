import { useNavigate } from '@tanstack/react-router';

import { resolveRedirectTarget } from '../lib/resolve-redirect-target';

/**
 * After login/registration: home through the router; any other target with a full page load, so the target route
 * starts from a clean state with the new session.
 */
export function useRedirectAfterAuth(): (redirectTo: string | undefined) => Promise<void> {
  const navigate = useNavigate();

  return async (redirectTo: string | undefined): Promise<void> => {
    const target = resolveRedirectTarget(redirectTo);
    if (target === '/') {
      await navigate({ to: '/' });
    } else {
      window.location.assign(`${window.location.origin}${target}`);
    }
  };
}
