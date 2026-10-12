import { useDeleteAccountMutation } from '@entities/session';

type DeleteAccount = {
  /** Deletes the account; never rejects — the session is gone anyway, the caller goes to /login either way. */
  deleteAccount: () => Promise<void>;
};

export function useDeleteAccount(): DeleteAccount {
  const deleteAccountMutation = useDeleteAccountMutation();

  return {
    deleteAccount: (): Promise<void> =>
      deleteAccountMutation
        .mutateAsync()
        .then((): void => undefined)
        .catch((): void => undefined),
  };
}
