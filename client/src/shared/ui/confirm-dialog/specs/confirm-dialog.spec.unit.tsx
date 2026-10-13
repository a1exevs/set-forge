import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC } from 'react';

import { useConfirm } from '@shared/lib';

import ConfirmDialog from '../confirm-dialog';
import ConfirmDialogProvider from '../confirm-dialog-provider';

const TestConsumer: FC<{ onConfirmResult?: (result: boolean) => void }> = ({ onConfirmResult }) => {
  const confirmDialog = useConfirm();

  const handleOpen = async (): Promise<void> => {
    const result = await confirmDialog({
      title: 'Test title',
      description: 'Test description',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel',
    });
    onConfirmResult?.(result);
  };

  return (
    <button type="button" onClick={handleOpen}>
      Open
    </button>
  );
};

describe('useConfirm', () => {
  describe('rendering', () => {
    it('renders dialog with title, description and buttons when opened', async () => {
      const user = userEvent.setup();
      render(
        <ConfirmDialogProvider>
          <TestConsumer />
        </ConfirmDialogProvider>,
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      await waitFor((): void => {
        expect(screen.getByText('Test title')).toBeInTheDocument();
        expect(screen.getByText('Test description')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      });
    });

    it('shows only Confirm button when hideCancelButton is true', async () => {
      const TestConsumerHideCancel: FC = () => {
        const confirmDialog = useConfirm();
        return (
          <button
            type="button"
            onClick={(): void => {
              confirmDialog({
                title: 'Alert',
                hideCancelButton: true,
                confirmationText: 'Ok',
              });
            }}
          >
            Open
          </button>
        );
      };

      const user = userEvent.setup();
      render(
        <ConfirmDialogProvider>
          <TestConsumerHideCancel />
        </ConfirmDialogProvider>,
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      await waitFor((): void => {
        expect(screen.getByRole('button', { name: 'Ok' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
      });
    });

    it('uses custom confirmationText and cancellationText', async () => {
      const TestConsumerCustom: FC = () => {
        const confirmDialog = useConfirm();
        return (
          <button
            type="button"
            onClick={(): void => {
              confirmDialog({
                title: 'Delete?',
                confirmationText: 'Delete',
                cancellationText: 'Keep',
              });
            }}
          >
            Open
          </button>
        );
      };

      const user = userEvent.setup();
      render(
        <ConfirmDialogProvider>
          <TestConsumerCustom />
        </ConfirmDialogProvider>,
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      await waitFor((): void => {
        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
      });
    });
  });

  describe('interactions', () => {
    it('returns true when Confirm is clicked', async () => {
      const user = userEvent.setup();
      const onConfirmResult = jest.fn();

      render(
        <ConfirmDialogProvider>
          <TestConsumer onConfirmResult={onConfirmResult} />
        </ConfirmDialogProvider>,
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      await waitFor((): void => {
        expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor((): void => {
        expect(onConfirmResult).toHaveBeenCalledWith(true);
      });
    });

    it('returns false when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const onConfirmResult = jest.fn();

      render(
        <ConfirmDialogProvider>
          <TestConsumer onConfirmResult={onConfirmResult} />
        </ConfirmDialogProvider>,
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      await waitFor((): void => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor((): void => {
        expect(onConfirmResult).toHaveBeenCalledWith(false);
      });
    });

    it('renders an alternate button when alternateText is provided', async () => {
      const TestConsumerAlternate: FC<{ onConfirmResult?: (result: string) => void }> = ({ onConfirmResult }) => {
        const confirmDialog = useConfirm();

        const handleOpen = async (): Promise<void> => {
          const result = await confirmDialog({
            title: 'Finish workout?',
            confirmationText: 'Finish',
            alternateText: 'Exit without saving',
            cancellationText: 'Cancel',
          });
          onConfirmResult?.(result);
        };

        return (
          <button type="button" onClick={handleOpen}>
            Open
          </button>
        );
      };

      const user = userEvent.setup();
      render(
        <ConfirmDialogProvider>
          <TestConsumerAlternate />
        </ConfirmDialogProvider>,
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      await waitFor((): void => {
        expect(screen.getByRole('button', { name: 'Exit without saving' })).toBeInTheDocument();
      });
    });

    it('returns alternate when the alternate button is clicked', async () => {
      const TestConsumerAlternate: FC<{ onConfirmResult?: (result: string) => void }> = ({ onConfirmResult }) => {
        const confirmDialog = useConfirm();

        const handleOpen = async (): Promise<void> => {
          const result = await confirmDialog({
            title: 'Finish workout?',
            confirmationText: 'Finish',
            alternateText: 'Exit without saving',
            cancellationText: 'Cancel',
          });
          onConfirmResult?.(result);
        };

        return (
          <button type="button" onClick={handleOpen}>
            Open
          </button>
        );
      };

      const user = userEvent.setup();
      const onConfirmResult = jest.fn();

      render(
        <ConfirmDialogProvider>
          <TestConsumerAlternate onConfirmResult={onConfirmResult} />
        </ConfirmDialogProvider>,
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));

      await waitFor((): void => {
        expect(screen.getByRole('button', { name: 'Exit without saving' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Exit without saving' }));

      await waitFor((): void => {
        expect(onConfirmResult).toHaveBeenCalledWith('alternate');
      });
    });

    it('returns confirm when Finish is clicked in a three-way dialog', async () => {
      const TestConsumerAlternate: FC<{ onConfirmResult?: (result: string) => void }> = ({ onConfirmResult }) => {
        const confirmDialog = useConfirm();

        const handleOpen = async (): Promise<void> => {
          const result = await confirmDialog({
            title: 'Finish workout?',
            confirmationText: 'Finish',
            alternateText: 'Exit without saving',
            cancellationText: 'Cancel',
          });
          onConfirmResult?.(result);
        };

        return (
          <button type="button" onClick={handleOpen}>
            Open
          </button>
        );
      };

      const user = userEvent.setup();
      const onConfirmResult = jest.fn();

      render(
        <ConfirmDialogProvider>
          <TestConsumerAlternate onConfirmResult={onConfirmResult} />
        </ConfirmDialogProvider>,
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));
      await user.click(await screen.findByRole('button', { name: 'Finish' }));

      await waitFor((): void => {
        expect(onConfirmResult).toHaveBeenCalledWith('confirm');
      });
    });
  });

  describe('actions', () => {
    type ActionConsumerProps = { action: () => Promise<unknown>; onResult: (result: boolean) => void };

    const ActionConsumer: FC<ActionConsumerProps> = ({ action, onResult }) => {
      const confirmDialog = useConfirm();
      return (
        <button
          type="button"
          onClick={async (): Promise<void> => {
            onResult(await confirmDialog({ title: 'Delete list?', confirmationText: 'Delete', onConfirm: action }));
          }}
        >
          Open
        </button>
      );
    };

    const openWithAction = async (
      action: () => Promise<unknown>,
      onResult: (result: boolean) => void = jest.fn(),
    ): Promise<ReturnType<typeof userEvent.setup>> => {
      const user = userEvent.setup();
      render(
        <ConfirmDialogProvider>
          <ActionConsumer action={action} onResult={onResult} />
        </ConfirmDialogProvider>,
      );
      await user.click(screen.getByRole('button', { name: 'Open' }));
      return user;
    };

    it('stays open while the action runs and ignores Cancel and Esc', async () => {
      let finish: () => void = (): void => undefined;
      const action = jest.fn(
        () =>
          new Promise<void>((resolve): void => {
            finish = resolve;
          }),
      );
      const onResult = jest.fn();
      const user = await openWithAction(action, onResult);

      await user.click(screen.getByRole('button', { name: 'Delete' }));
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await user.keyboard('{Escape}');

      expect(action).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Delete list?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute('aria-busy', 'true');
      expect(onResult).not.toHaveBeenCalled();

      finish();
      await waitFor((): void => expect(onResult).toHaveBeenCalledWith(true));
      expect(screen.queryByText('Delete list?')).not.toBeInTheDocument();
    });

    it('ignores a second press of Confirm while the action runs', async () => {
      const action = jest.fn(() => new Promise<void>((): void => undefined));
      const user = await openWithAction(action);

      await user.click(screen.getByRole('button', { name: 'Delete' }));
      await user.click(screen.getByRole('button', { name: 'Delete' }));

      expect(action).toHaveBeenCalledTimes(1);
    });

    it('stays open with its buttons back to normal when the action fails', async () => {
      const action = jest.fn().mockRejectedValue(new Error('offline'));
      const onResult = jest.fn();
      const user = await openWithAction(action, onResult);

      await user.click(screen.getByRole('button', { name: 'Delete' }));

      await waitFor((): void =>
        expect(screen.getByRole('button', { name: 'Delete' })).not.toHaveAttribute('aria-busy'),
      );
      expect(screen.getByText('Delete list?')).toBeInTheDocument();
      expect(onResult).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor((): void => expect(onResult).toHaveBeenCalledWith(false));
    });
  });

  describe('error', () => {
    it('throws when used outside ConfirmDialogProvider', () => {
      const TestConsumerNoProvider: FC = () => {
        useConfirm();
        return null;
      };

      expect((): void => {
        render(<TestConsumerNoProvider />);
      }).toThrow('useConfirm must be used within ConfirmDialogProvider');
    });
  });
});

describe('ConfirmDialog', () => {
  it('renders nothing while closed', () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        title="Delete list?"
        confirmationText="Delete"
        cancellationText="Cancel"
        hideCancelButton={false}
        confirmProgress="idle"
        alternateProgress="idle"
        cancelProgress="idle"
        onConfirm={jest.fn()}
        onAlternate={jest.fn()}
        onCancel={jest.fn()}
        onClose={jest.fn()}
        ariaLabel="Delete list?"
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
