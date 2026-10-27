import { FC } from 'react';
import { Toaster as SonnerToaster } from 'sonner';

import type { Theme } from '@shared/lib';

import classes from './toaster.module.scss';

type Props = {
  theme: Theme;
  /** The name screen readers give the toast region; sonner adds its keyboard shortcut. */
  ariaLabel: string;
};

const Toaster: FC<Props> = ({ theme, ariaLabel }) => {
  return (
    <SonnerToaster
      theme={theme}
      containerAriaLabel={ariaLabel}
      position="bottom-left"
      closeButton
      className={classes.toaster}
      toastOptions={{
        classNames: {
          toast: classes.toast,
          title: classes.title,
          description: classes.description,
          success: classes.success,
          error: classes.error,
          warning: classes.warning,
        },
      }}
    />
  );
};

export default Toaster;
