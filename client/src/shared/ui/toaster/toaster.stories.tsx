import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { FC, ReactElement } from 'react';

import { Caption, Row, Stack, withFrame } from 'storybook-dir/showcase';

import { toastError, toastSuccess } from '@shared/lib';

import Toaster from './toaster-data-layer';
import Button from '../button/button';

const meta = {
  title: 'Shared/Toaster',
  component: Toaster,
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'The Sonner toaster mounted once in the app root; `toastSuccess` / `toastError` from `@shared/lib` fire the ' +
          'toasts. Bottom-left, with a close button, themed by the theme store.',
      },
    },
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

const ToasterDemo: FC = () => (
  <Stack>
    <Caption>Toasts appear at the bottom-left of the viewport.</Caption>
    <Row>
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
          toastError('Failed to update workout list');
        }}
      >
        Failure
      </Button>
    </Row>
    <Toaster />
  </Stack>
);

const clickToast =
  (name: string): Story['play'] =>
  async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button', { name }));
  };

/** A success toast: the message alone. */
export const Success: Story = {
  render: (): ReactElement => <ToasterDemo />,
  play: clickToast('Success'),
};

/** An error toast: `toastError` shows the message its caller translated. */
export const Failure: Story = {
  render: (): ReactElement => <ToasterDemo />,
  play: clickToast('Failure'),
};
