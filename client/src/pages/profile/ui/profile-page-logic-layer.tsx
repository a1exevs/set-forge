import { FC } from 'react';

import { useConfirm, useProgress, useT } from '@shared/lib';
import { useMainTabSwipe } from '@widgets/main-tabs-bar';

import ProfilePage from './profile-page';

type Props = {
  email: string;
  avatarLetter: string;
  /** Never rejects. */
  onLogout: () => Promise<void>;
  /** Never rejects. */
  onDeleteAccount: () => Promise<void>;
  /** Leaves the profile once the session has ended — after logout and account deletion, also when they failed. */
  onLeave: () => void;
};

const ProfilePageLogicLayer: FC<Props> = ({ email, avatarLetter, onLogout, onDeleteAccount, onLeave }) => {
  const { t } = useT();
  const swipeRef = useMainTabSwipe();
  const confirmDialog = useConfirm();
  // Deletion runs in its dialog, which covers the page; only logout needs to lock the other button.
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
      onConfirm: onDeleteAccount,
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
