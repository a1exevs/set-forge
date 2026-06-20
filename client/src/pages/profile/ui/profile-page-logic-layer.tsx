import { FC } from 'react';

import ProfilePage from 'src/pages/profile/ui/profile-page';

type Props = {
  email: string;
  avatarLetter: string;
  onLogout: () => void | Promise<void>;
  isLoggingOut: boolean;
};

const ProfilePageLogicLayer: FC<Props> = props => {
  return <ProfilePage {...props} />;
};

export default ProfilePageLogicLayer;
