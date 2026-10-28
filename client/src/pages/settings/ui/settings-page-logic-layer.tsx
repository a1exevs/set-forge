import { useRouter } from '@tanstack/react-router';
import { FC } from 'react';

import { useT } from '@shared/lib';

import SettingsPage from './settings-page';

const SettingsPageLogicLayer: FC = () => {
  const { t } = useT();
  const router = useRouter();

  // Settings opens from Profile; a direct load or a new tab has no history to step back through.
  const handleBack = (): void => {
    if (router.history.canGoBack()) {
      router.history.back();
    } else {
      void router.navigate({ to: '/profile' });
    }
  };

  return <SettingsPage t={t} onBack={handleBack} />;
};

export default SettingsPageLogicLayer;
