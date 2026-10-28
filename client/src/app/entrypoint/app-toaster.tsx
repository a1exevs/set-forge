import { FC } from 'react';

import { useT } from '@shared/lib';
import { Toaster } from '@shared/ui';

/** The toaster of the app, named in the chosen language; it lives outside the router, so it reads the language here. */
const AppToaster: FC = () => {
  const { t } = useT();

  return <Toaster ariaLabel={t('toaster.label')} />;
};

export default AppToaster;
