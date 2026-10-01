import { FC } from 'react';

import { emailToAvatarLetter, useCurrentUserQuery } from '@entities/session';
import { useLogout } from '@features/logout';

import ProfilePageLogicLayer from './profile-page-logic-layer';
import { useDeleteAccount } from '../model/use-delete-account';

const ProfilePageDataLayer: FC = () => {
  const { data: user } = useCurrentUserQuery(true);
  const { logout, isPending: isLoggingOut } = useLogout();
  const { deleteAccount, isPending: isDeletingAccount } = useDeleteAccount();

  return (
    <ProfilePageLogicLayer
      email={user?.email ?? ''}
      avatarLetter={user ? emailToAvatarLetter(user.email) : '?'}
      onLogout={logout}
      isLoggingOut={isLoggingOut}
      onDeleteAccount={deleteAccount}
      isDeletingAccount={isDeletingAccount}
    />
  );
};

export default ProfilePageDataLayer;
