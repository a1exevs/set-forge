import { Link } from '@tanstack/react-router';
import { Settings } from 'lucide-react';
import { FC, RefObject } from 'react';

import type { Progress, Translate } from '@shared/lib';
import { BrandWordmark, Button, IconButton, UserAvatar } from '@shared/ui';
import { LegalFooter } from '@widgets/legal-footer';
import { MainTabsBar } from '@widgets/main-tabs-bar';

import classes from './profile-page.module.scss';

type Props = {
  t: Translate;
  swipeRef: RefObject<HTMLDivElement>;
  email: string;
  avatarLetter: string;
  logoutProgress: Progress;
  deleteAccountProgress: Progress;
  onLogout: () => void | Promise<void>;
  onDeleteAccount: () => void | Promise<void>;
};

const ProfilePage: FC<Props> = ({
  t,
  swipeRef,
  email,
  avatarLetter,
  logoutProgress,
  deleteAccountProgress,
  onLogout,
  onDeleteAccount,
}) => {
  return (
    <div ref={swipeRef} className={classes.container}>
      <header className={classes.header}>
        <div className={classes.headerTop}>
          <BrandWordmark title="Profile" />
          <IconButton as={Link} to="/settings" aria-label={t('profile.openSettings')} title={t('profile.openSettings')}>
            <Settings size={20} strokeWidth={1.75} aria-hidden />
          </IconButton>
        </div>
      </header>

      <main className={classes.main}>
        <div className={classes.account}>
          <UserAvatar letter={avatarLetter} />
          <p className={classes.email}>{email}</p>
          <Button
            variant="secondary"
            progress={logoutProgress}
            onClick={(): void => void onLogout()}
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
            progress={deleteAccountProgress}
            onClick={(): void => void onDeleteAccount()}
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
