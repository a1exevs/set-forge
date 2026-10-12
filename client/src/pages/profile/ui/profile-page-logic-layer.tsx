import { FC } from 'react';

import { useConfirm, useProgress } from '@shared/lib';
import { useMainTabSwipe } from '@widgets/main-tabs-bar';

import ProfilePage from './profile-page';

type Props = {
  email: string;
  avatarLetter: string;
  /** Never rejects (see `useLogout`). */
  onLogout: () => Promise<void>;
  /** Never rejects (see `useDeleteAccount`). */
  onDeleteAccount: () => Promise<void>;
  /** To /login — after logout and after account deletion, also when their request failed. */
  onLeave: () => void;
};

const ProfilePageLogicLayer: FC<Props> = ({ email, avatarLetter, onLogout, onDeleteAccount, onLeave }) => {
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
      title: 'Delete account?',
      description:
        'This permanently deletes your account and all your data (workout lists, exercises, and session history). This cannot be undone.',
      confirmationText: 'Delete account',
      cancellationText: 'Cancel',
      onConfirm: onDeleteAccount,
    });
    if (ok) {
      onLeave();
    }
  };

  return (
    <ProfilePage
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
