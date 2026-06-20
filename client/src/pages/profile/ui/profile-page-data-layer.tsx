import { FC } from 'react';

import { emailToAvatarLetter, useCurrentUserQuery, useLogoutMutation } from '@entities';

import ProfilePageLogicLayer from 'src/pages/profile/ui/profile-page-logic-layer';

const ProfilePageDataLayer: FC = () => {
  const { data: user } = useCurrentUserQuery(true);
  const logoutMutation = useLogoutMutation();

  return (
    <ProfilePageLogicLayer
      email={user?.email ?? ''}
      avatarLetter={user ? emailToAvatarLetter(user.email) : '?'}
      onLogout={(): void => {
        logoutMutation.mutate();
      }}
      isLoggingOut={logoutMutation.isPending}
    />
  );
};

export default ProfilePageDataLayer;
