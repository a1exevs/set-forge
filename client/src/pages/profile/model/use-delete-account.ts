import { useDeleteAccountMutation } from '@entities/session';

type DeleteAccount = {
  /** Resolves once the session has ended; rejects when the account stays and the session goes on. */
  deleteAccount: () => Promise<void>;
};

export function useDeleteAccount(): DeleteAccount {
  const deleteAccountMutation = useDeleteAccountMutation();

  return {
    deleteAccount: async (): Promise<void> => {
      await deleteAccountMutation.mutateAsync();
    },
  };
}
