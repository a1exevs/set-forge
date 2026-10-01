import { FC } from 'react';

import { useThemeStore } from '@shared/lib';

import Toaster from './toaster';

/** Mounts the toaster with the current theme (the store is read here, not in the presentation). */
const ToasterDataLayer: FC = () => {
  const theme = useThemeStore.use.theme();

  return <Toaster theme={theme} />;
};

export default ToasterDataLayer;
