import { FC } from 'react';

import { useConfirm } from '@shared';

import ProfilePage from 'src/pages/profile/ui/profile-page';

type Props = {
  email: string;
  avatarLetter: string;
  onLogout: () => void | Promise<void>;
  isLoggingOut: boolean;
  onDeleteAccount: () => Promise<void>;
  isDeletingAccount: boolean;
};

const ProfilePageLogicLayer: FC<Props> = ({ onDeleteAccount, isDeletingAccount, ...props }) => {
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

  return <ProfilePage {...props} onDeleteAccount={handleDeleteAccount} isDeletingAccount={isDeletingAccount} />;
};

export default ProfilePageLogicLayer;
