import { useNavigate } from '@tanstack/react-router';

import { useDeleteAccountMutation } from '@entities/session';

type DeleteAccount = {
  deleteAccount: () => Promise<void>;
  isPending: boolean;
};

/** Deletes the account and sends the user to /login — also when the request fails (the session is gone anyway). */
export function useDeleteAccount(): DeleteAccount {
  const navigate = useNavigate();
  const deleteAccountMutation = useDeleteAccountMutation();

  return {
    deleteAccount: (): Promise<void> =>
      deleteAccountMutation
        .mutateAsync()
        .catch(() => undefined)
        .finally(() => navigate({ to: '/login' })),
    isPending: deleteAccountMutation.isPending,
  };
}
