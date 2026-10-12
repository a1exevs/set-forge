import { useDeleteAccountMutation } from '@entities/session';

type DeleteAccount = {
  /** Deletes the account; never rejects — the session ends either way. */
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
