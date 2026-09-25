import { useNavigate } from '@tanstack/react-router';

import { useLogoutMutation } from '@entities/session';

type Logout = {
  logout: () => void;
  isPending: boolean;
};

/** Signs the user out and sends them to /login — also when the request fails (the local session is gone anyway). */
export function useLogout(): Logout {
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();

  return {
    logout: (): void => {
      void logoutMutation
        .mutateAsync()
        .catch(() => undefined)
        .finally(() => navigate({ to: '/login' }));
    },
    isPending: logoutMutation.isPending,
  };
}
