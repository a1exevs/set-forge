import { FC } from 'react';

import { useThemeStore } from '@shared/lib';

import Toaster from './toaster';

/** Mounts the toaster with the current theme (the store is read here, not in the presentation). */
type Props = {
  /** The name screen readers give the toast region. */
  ariaLabel: string;
};

const ToasterDataLayer: FC<Props> = ({ ariaLabel }) => {
  const theme = useThemeStore.use.theme();

  return <Toaster theme={theme} ariaLabel={ariaLabel} />;
};

export default ToasterDataLayer;
