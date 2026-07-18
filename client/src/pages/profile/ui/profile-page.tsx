import { Link, useRouterState } from '@tanstack/react-router';
import { FC } from 'react';

import { BrandWordmark, Button, UserAvatar, useTabSwipeNavigation } from '@shared';
import { MAIN_TAB_ROUTES, MainTabsBar } from '@widgets';

import classes from 'src/pages/profile/ui/profile-page.module.scss';

type Props = {
  email: string;
  avatarLetter: string;
  onLogout: () => void | Promise<void>;
  isLoggingOut: boolean;
  onDeleteAccount: () => void | Promise<void>;
  isDeletingAccount: boolean;
};

const ProfilePage: FC<Props> = ({
  email,
  avatarLetter,
  onLogout,
  isLoggingOut,
  onDeleteAccount,
  isDeletingAccount,
}) => {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const swipeRef = useTabSwipeNavigation({ tabs: MAIN_TAB_ROUTES, activePath: pathname });

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

        <footer className={classes.legal}>
          <Link to="/privacy" className={classes.legalLink}>
            Privacy Policy
          </Link>
          <span className={classes.legalSep} aria-hidden>
            ·
          </span>
          <Link to="/terms" className={classes.legalLink}>
            Terms of Service
          </Link>
        </footer>
      </main>

      <MainTabsBar />
    </div>
  );
};

export default ProfilePage;
