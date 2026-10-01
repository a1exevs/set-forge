import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { FC, ReactElement, useState } from 'react';

import { Caption, Row, Stack, withFrame } from 'storybook-dir/showcase';

import { type ConfirmOptions, useConfirm } from '@shared/lib';

import ConfirmDialogProvider from './confirm-dialog-provider';
import Button from '../button/button';

const OPEN_LABEL = 'Open confirm dialog';

const meta: Meta<typeof ConfirmDialogProvider> = {
  title: 'Shared/ConfirmDialog',
  component: ConfirmDialogProvider,
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'Confirmation as a promise: `useConfirm()` from `@shared/lib` opens the dialog the provider renders and ' +
          'resolves with the answer. Two buttons by default, one with `hideCancelButton`, three with `alternateText`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

type OpenerProps = { options: ConfirmOptions };

const ConfirmOpener: FC<OpenerProps> = ({ options }) => {
  const confirm = useConfirm();
  const [answer, setAnswer] = useState<string>('—');

  return (
    <Stack>
      <Caption>Answer: {answer}</Caption>
      <Row>
        <Button
          onClick={async (): Promise<void> => {
            setAnswer(String(await confirm(options)));
          }}
        >
          {OPEN_LABEL}
        </Button>
      </Row>
    </Stack>
  );
};

const renderOpener = (options: ConfirmOptions) => (): ReactElement => (
  <ConfirmDialogProvider>
    <ConfirmOpener options={options} />
  </ConfirmDialogProvider>
);

const openDialog: Story['play'] = async ({ canvasElement }): Promise<void> => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: OPEN_LABEL }));
};

/** Confirm or cancel: the promise resolves `true` / `false`. */
export const Default: Story = {
  render: renderOpener({
    title: 'Delete workout list?',
    description: 'This action cannot be undone.',
    confirmationText: 'Delete',
    cancellationText: 'Cancel',
  }),
  play: openDialog,
};

/** `hideCancelButton`: an alert with one way out. */
export const Alert: Story = {
  render: renderOpener({ title: 'Please enter a list name', confirmationText: 'Ok', hideCancelButton: true }),
  play: openDialog,
};

/** `alternateText` adds a third answer; the promise resolves `'confirm' | 'alternate' | 'cancel'`. */
export const ThreeAnswers: Story = {
  render: renderOpener({
    title: 'Finish workout?',
    description: 'Two exercises still have sets left.',
    confirmationText: 'Finish',
    alternateText: 'Discard',
    cancellationText: 'Keep going',
  }),
  play: openDialog,
};
