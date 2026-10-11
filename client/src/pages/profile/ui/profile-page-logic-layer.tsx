import { FC } from 'react';

import { useConfirm } from '@shared/lib';
import { useMainTabSwipe } from '@widgets/main-tabs-bar';

import ProfilePage from './profile-page';

type Props = {
  email: string;
  avatarLetter: string;
  onLogout: () => void | Promise<void>;
  isLoggingOut: boolean;
  onDeleteAccount: () => Promise<void>;
  isDeletingAccount: boolean;
};

const ProfilePageLogicLayer: FC<Props> = ({ onDeleteAccount, isDeletingAccount, ...props }) => {
  const swipeRef = useMainTabSwipe();
  const confirmDialog = useConfirm();

  const handleDeleteAccount = async (): Promise<void> => {
    const ok = await confirmDialog({
      title: 'Delete account?',
      description:
        'This permanently deletes your account and all your data (workout lists, exercises, and session history). This cannot be undone.',
      confirmationText: 'Delete account',
      cancellationText: 'Cancel',
    });
    if (ok) {
      await onDeleteAccount();
    }
  };

  return (
    <ProfilePage
      {...props}
      swipeRef={swipeRef}
      onDeleteAccount={handleDeleteAccount}
      isDeletingAccount={isDeletingAccount}
    />
  );
};

export default ProfilePageLogicLayer;
