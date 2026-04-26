import type { Meta } from '@storybook/react';
import { FC, useEffect, useState } from 'react';

import { buildDesktopStoryObj, buildMobileStoryObj, buildTabletStoryObj } from 'storybook-dir/helpers';

import Button from 'src/shared/ui/button/button';
import ConfirmDialogProvider from 'src/shared/ui/confirm-dialog/confirm-dialog-provider';
import classes from 'src/shared/ui/confirm-dialog/confirm-dialog.stories.module.scss';
import { useConfirm } from 'src/shared/ui/confirm-dialog/hooks/use-confirm';

const storyTitle = 'Shared/ConfirmDialog';

const meta = {
  title: storyTitle,
  component: ConfirmDialogProvider,
} satisfies Meta<typeof ConfirmDialogProvider>;

export default meta;

const ConfirmDialogOpener: FC<{ options: Parameters<ReturnType<typeof useConfirm>>[0] }> = ({ options }) => {
  const confirmDialog = useConfirm();
  const [result, setResult] = useState<string | null>(null);

  const handleOpen = async (): Promise<void> => {
    const ok = await confirmDialog(options);
    setResult(ok ? 'Confirmed' : 'Cancelled');
  };

  return (
    <div className={classes.storyWrapper}>
      <h1 className={classes.storyTitle}>Confirm Dialog</h1>
      <p className={classes.storyText}>Click the button to open the confirmation dialog. Result: {result ?? '—'}</p>
      <Button onClick={handleOpen}>Open Confirm Dialog</Button>
    </div>
  );
};

const ConfirmDialogRenderStory: FC<{ options: Parameters<ReturnType<typeof useConfirm>>[0] }> = ({ options }) => {
  const confirmDialog = useConfirm();

  useEffect((): void => {
    confirmDialog(options);
  }, [confirmDialog, options]);

  return <div className={classes.storyWrapper} />;
};

const defaultOptions = {
  title: 'Delete workout list?',
  description: 'This action cannot be undone.',
  confirmationText: 'Delete',
  cancellationText: 'Cancel',
};

export const Desktop = buildDesktopStoryObj({
  render: () => (
    <ConfirmDialogProvider>
      <ConfirmDialogRenderStory options={defaultOptions} />
    </ConfirmDialogProvider>
  ),
});

export const Tablet = buildTabletStoryObj({
  render: () => (
    <ConfirmDialogProvider>
      <ConfirmDialogRenderStory options={defaultOptions} />
    </ConfirmDialogProvider>
  ),
});

export const Mobile = buildMobileStoryObj({
  render: () => (
    <ConfirmDialogProvider>
      <ConfirmDialogRenderStory options={defaultOptions} />
    </ConfirmDialogProvider>
  ),
});

export const AlertStyle = buildDesktopStoryObj({
  render: () => (
    <ConfirmDialogProvider>
      <ConfirmDialogRenderStory
        options={{
          title: 'Please enter a list name',
          hideCancelButton: true,
          confirmationText: 'Ok',
        }}
      />
    </ConfirmDialogProvider>
  ),
});

export const InteractiveDesktop = {
  ...buildDesktopStoryObj({}),
  render: () => (
    <ConfirmDialogProvider>
      <ConfirmDialogOpener options={defaultOptions} />
    </ConfirmDialogProvider>
  ),
};

export const InteractiveTablet = {
  ...buildTabletStoryObj({}),
  render: () => (
    <ConfirmDialogProvider>
      <ConfirmDialogOpener options={defaultOptions} />
    </ConfirmDialogProvider>
  ),
};

export const InteractiveMobile = {
  ...buildMobileStoryObj({}),
  render: () => (
    <ConfirmDialogProvider>
      <ConfirmDialogOpener options={defaultOptions} />
    </ConfirmDialogProvider>
  ),
};
