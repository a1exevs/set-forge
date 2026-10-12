import { FC } from 'react';

import { emailToAvatarLetter, useCurrentUserQuery } from '@entities/session';
import { useLogout } from '@features/logout';

import ProfilePageLogicLayer from './profile-page-logic-layer';
import { useDeleteAccount } from '../model/use-delete-account';

const ProfilePageDataLayer: FC = () => {
  const { data: user } = useCurrentUserQuery(true);
  const { logout, leave } = useLogout();
  const { deleteAccount } = useDeleteAccount();

  return (
    <ProfilePageLogicLayer
      email={user?.email ?? ''}
      avatarLetter={user ? emailToAvatarLetter(user.email) : '?'}
      onLogout={logout}
      onDeleteAccount={deleteAccount}
      onLeave={leave}
    />
  );
};

export default ProfilePageDataLayer;
