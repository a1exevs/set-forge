import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC } from 'react';

import ConfirmDialogProvider from 'src/shared/ui/confirm-dialog/confirm-dialog-provider';
import { useConfirm } from 'src/shared/ui/confirm-dialog/hooks/use-confirm';

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
