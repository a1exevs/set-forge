import { useNavigate } from '@tanstack/react-router';
import { FC } from 'react';

import { emailToAvatarLetter, useCurrentUserQuery, useDeleteAccountMutation } from '@entities/session';
import { useLogout } from '@features/logout';

import ProfilePageLogicLayer from './profile-page-logic-layer';

const ProfilePageDataLayer: FC = () => {
  const { data: user } = useCurrentUserQuery(true);
  const navigate = useNavigate();
  const { logout, isPending: isLoggingOut } = useLogout();
  const deleteAccountMutation = useDeleteAccountMutation();

  return (
    <ProfilePageLogicLayer
      email={user?.email ?? ''}
      avatarLetter={user ? emailToAvatarLetter(user.email) : '?'}
      onLogout={logout}
      isLoggingOut={isLoggingOut}
      onDeleteAccount={(): Promise<void> =>
        deleteAccountMutation
          .mutateAsync()
          .catch(() => undefined)
          .finally(() => navigate({ to: '/login' }))
      }
      isDeletingAccount={deleteAccountMutation.isPending}
    />
  );
};

export default ProfilePageDataLayer;
