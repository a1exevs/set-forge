import type { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from '@storybook/test';
import { FC, ReactElement, useRef, useState } from 'react';

import { Caption, Panel, Row, Stack, withFrame } from 'storybook-dir/showcase';

import Dialog from './dialog';
import Button from '../button/button';
import buttonClasses from '../button/button.module.scss';

const OPEN_LABEL = 'Open dialog';

const meta = {
  title: 'Shared/Dialog',
  component: Dialog,
  args: {
    open: true,
    onClose: fn(),
    disableAnimation: true,
    ariaLabel: 'Example dialog',
    children: (
      <Panel>
        <Stack>
          <h2>Dialog title</h2>
          <Caption>Focus stays inside; `Esc` and a click on the backdrop call `onClose`.</Caption>
        </Stack>
      </Panel>
    ),
  },
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'A modal over a backdrop (Headless UI `Dialog`): focus is trapped inside, `Esc` and a click outside call ' +
          '`onClose`. `ConfirmDialog` is the everyday consumer; `children` is the whole panel.',
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

type OpenerProps = {
  /** Focus the destructive button first instead of the first focusable element. */
  focusDelete?: boolean;
};

const DialogOpener: FC<OpenerProps> = ({ focusDelete = false }) => {
  const [open, setOpen] = useState(false);
  const deleteRef = useRef<HTMLButtonElement>(null);

  return (
    <Stack>
      <Caption>Opens with a fade; closes on `Esc`, on the backdrop and on either button.</Caption>
      <Row>
        <Button onClick={(): void => setOpen(true)}>{OPEN_LABEL}</Button>
      </Row>
      <Dialog
        open={open}
        onClose={(): void => setOpen(false)}
        initialFocus={focusDelete ? deleteRef : undefined}
        ariaLabel="Delete workout list"
      >
        <Panel>
          <Stack>
            <h2>Delete workout list?</h2>
            <Caption>This action cannot be undone.</Caption>
            <Row>
              <Button variant="secondary" onClick={(): void => setOpen(false)}>
                Cancel
              </Button>
              {/* `Button` does not forward refs; the native button borrows its classes. */}
              <button
                ref={deleteRef}
                type="button"
                className={`${buttonClasses.button} ${buttonClasses.danger} ${buttonClasses.md}`}
                onClick={(): void => setOpen(false)}
              >
                Delete
              </button>
            </Row>
          </Stack>
        </Panel>
      </Dialog>
    </Stack>
  );
};

const openDialog: Story['play'] = async ({ canvasElement }): Promise<void> => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: OPEN_LABEL }));
};

/** Open, with the default black backdrop. */
export const Default: Story = {};

/** `backdropColor` tints the backdrop. */
export const CustomBackdrop: Story = {
  args: { backdropColor: '#0256b0' },
};

/** Opened by a button: the transition plays, focus moves to the first control and returns on close. */
export const Interactive: Story = {
  render: (): ReactElement => <DialogOpener />,
  play: openDialog,
};

/** `initialFocus` lands on the destructive button instead of the first focusable element. */
export const InitialFocus: Story = {
  render: (): ReactElement => <DialogOpener focusDelete />,
  play: openDialog,
};
