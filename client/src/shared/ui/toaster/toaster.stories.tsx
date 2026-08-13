import type { Meta } from '@storybook/react';
import { FC, useEffect } from 'react';

import { buildDesktopStoryObj, buildMobileStoryObj, buildTabletStoryObj } from 'storybook-dir/helpers';

import Button from 'src/shared/ui/button/button';
import { toastError, toastSuccess } from 'src/shared/ui/toaster/toast';
import Toaster from 'src/shared/ui/toaster/toaster';
import classes from 'src/shared/ui/toaster/toaster.stories.module.scss';

const storyTitle = 'Shared/Toaster';

const meta = {
  title: storyTitle,
  component: Toaster,
} satisfies Meta<typeof Toaster>;

export default meta;

const ToasterDemo: FC = () => (
  <div className={classes.storyWrapper}>
    <h1 className={classes.storyTitle}>Toaster</h1>
    <p className={classes.storyText}>Toasts appear at the bottom-left. Try success and error variants.</p>
    <div className={classes.actions}>
      <Button
        onClick={(): void => {
          toastSuccess('Workout list created');
        }}
      >
        Success
      </Button>
      <Button
        variant="danger"
        onClick={(): void => {
          toastError(new Error('Something went wrong'), 'Failed');
        }}
      >
        Error
      </Button>
      <Button
        variant="secondary"
        onClick={(): void => {
          toastError(null, 'Failed to start workout session');
        }}
      >
        Fallback error
      </Button>
    </div>
    <Toaster />
  </div>
);

const ToasterRenderStory: FC<{ show: () => void }> = ({ show }) => {
  useEffect((): void => {
    show();
  }, [show]);

  return (
    <div className={classes.storyWrapper}>
      <Toaster />
    </div>
  );
};

export const Desktop = buildDesktopStoryObj({
  render: () => (
    <ToasterRenderStory
      show={(): void => {
        toastSuccess('Workout list created');
      }}
    />
  ),
});

export const Tablet = buildTabletStoryObj({
  render: () => (
    <ToasterRenderStory
      show={(): void => {
        toastSuccess('Workout list created');
      }}
    />
  ),
});

export const Mobile = buildMobileStoryObj({
  render: () => (
    <ToasterRenderStory
      show={(): void => {
        toastSuccess('Workout list created');
      }}
    />
  ),
});

export const ErrorDesktop = buildDesktopStoryObj({
  render: () => (
    <ToasterRenderStory
      show={(): void => {
        toastError(new Error('Failed to update workout list'), 'Failed');
      }}
    />
  ),
});

export const InteractiveDesktop = {
  ...buildDesktopStoryObj({}),
  render: () => <ToasterDemo />,
};

export const InteractiveTablet = {
  ...buildTabletStoryObj({}),
  render: () => <ToasterDemo />,
};

export const InteractiveMobile = {
  ...buildMobileStoryObj({}),
  render: () => <ToasterDemo />,
};
