import { FC, RefObject } from 'react';

import { BrandWordmark, Button, UserAvatar } from '@shared/ui';
import { LegalFooter } from '@widgets/legal-footer';
import { MainTabsBar } from '@widgets/main-tabs-bar';

import classes from './profile-page.module.scss';

type Props = {
  swipeRef: RefObject<HTMLDivElement>;
  email: string;
  avatarLetter: string;
  onLogout: () => void | Promise<void>;
  isLoggingOut: boolean;
  onDeleteAccount: () => void | Promise<void>;
  isDeletingAccount: boolean;
};

const ProfilePage: FC<Props> = ({
  swipeRef,
  email,
  avatarLetter,
  onLogout,
  isLoggingOut,
  onDeleteAccount,
  isDeletingAccount,
}) => {
  return (
    <div ref={swipeRef} className={classes.container}>
      <header className={classes.header}>
        <div className={classes.headerTop}>
          <BrandWordmark title="Profile" />
        </div>
      </header>

      <main className={classes.main}>
        <div className={classes.account}>
          <UserAvatar letter={avatarLetter} />
          <p className={classes.email}>{email}</p>
          <Button
            variant="secondary"
            onClick={(): void => void onLogout()}
            disabled={isLoggingOut}
            className={classes.logoutButton}
          >
            Log out
          </Button>
        </div>

        <div className={classes.dangerZone}>
          <p className={classes.dangerHint}>
            Deleting your account permanently removes all your data. This cannot be undone.
          </p>
          <Button
            variant="danger"
            onClick={(): void => void onDeleteAccount()}
            disabled={isDeletingAccount}
            className={classes.deleteButton}
          >
            Delete account
          </Button>
        </div>

        <LegalFooter className={classes.legal} />
      </main>

      <MainTabsBar />
    </div>
  );
};

export default ProfilePage;
