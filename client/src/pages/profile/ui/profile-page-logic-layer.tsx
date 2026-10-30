import { FC } from 'react';

import { toastError, useConfirm, useProgress, useT } from '@shared/lib';
import { useMainTabSwipe } from '@widgets/main-tabs-bar';

import ProfilePage from './profile-page';

type Props = {
  email: string;
  avatarLetter: string;
  /** Never rejects. */
  onLogout: () => Promise<void>;
  /** Resolves once the session has ended; rejects when the account stays and the user stays signed in. */
  onDeleteAccount: () => Promise<void>;
  /** Leaves the profile once the session has ended (session/logout-ends-on-login). */
  onLeave: () => void;
};

const ProfilePageLogicLayer: FC<Props> = ({ email, avatarLetter, onLogout, onDeleteAccount, onLeave }) => {
  const { t } = useT();
  const swipeRef = useMainTabSwipe();
  const confirmDialog = useConfirm();
  // Only logout locks the other action: deletion runs inside its confirm dialog.
  const { run, progressOf } = useProgress<'logout' | 'deleteAccount'>();

  const handleLogout = async (): Promise<void> => {
    if (await run('logout', onLogout)) {
      onLeave();
    }
  };

  const handleDeleteAccount = async (): Promise<void> => {
    const ok = await confirmDialog({
      title: t('profile.deleteAccountDialog.title'),
      description: t('profile.deleteAccountDialog.description'),
      confirmationText: t('profile.deleteAccount'),
      cancellationText: t('common.cancel'),
      onConfirm: async (): Promise<void> => {
        try {
          await onDeleteAccount();
        } catch (error: unknown) {
          toastError(t('profile.toasts.deleteAccountFailed'));
          throw error;
        }
      },
    });
    if (ok) {
      onLeave();
    }
  };

  return (
    <ProfilePage
      t={t}
      swipeRef={swipeRef}
      email={email}
      avatarLetter={avatarLetter}
      logoutProgress={progressOf('logout')}
      deleteAccountProgress={progressOf('deleteAccount')}
      onLogout={handleLogout}
      onDeleteAccount={handleDeleteAccount}
    />
  );
};

export default ProfilePageLogicLayer;
