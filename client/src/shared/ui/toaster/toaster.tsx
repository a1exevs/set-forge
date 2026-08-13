import { FC } from 'react';
import { Toaster as SonnerToaster } from 'sonner';

import { useThemeStore } from 'src/shared/model';
import classes from 'src/shared/ui/toaster/toaster.module.scss';

const Toaster: FC = () => {
  const theme = useThemeStore.use.theme();

  return (
    <SonnerToaster
      theme={theme}
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
