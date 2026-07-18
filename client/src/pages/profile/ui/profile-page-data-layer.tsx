import { FC } from 'react';

import { emailToAvatarLetter, useCurrentUserQuery, useDeleteAccountMutation, useLogoutMutation } from '@entities';

import ProfilePageLogicLayer from 'src/pages/profile/ui/profile-page-logic-layer';

const ProfilePageDataLayer: FC = () => {
  const { data: user } = useCurrentUserQuery(true);
  const logoutMutation = useLogoutMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  return (
    <ProfilePageLogicLayer
      email={user?.email ?? ''}
      avatarLetter={user ? emailToAvatarLetter(user.email) : '?'}
      onLogout={(): void => {
        logoutMutation.mutate();
      }}
      isLoggingOut={logoutMutation.isPending}
      onDeleteAccount={async (): Promise<void> => {
        await deleteAccountMutation.mutateAsync();
      }}
      isDeletingAccount={deleteAccountMutation.isPending}
    />
  );
};

export default ProfilePageDataLayer;
