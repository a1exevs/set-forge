import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC } from 'react';

import ConfirmDialogProvider from 'src/shared/ui/confirm-dialog/confirm-dialog-provider';
import { useConfirm } from 'src/shared/ui/confirm-dialog/hooks/use-confirm';

const ConfirmDialogOpener: FC<{
  options: Parameters<ReturnType<typeof useConfirm>>[0];
}> = ({ options }) => {
  const confirmDialog = useConfirm();

  return (
    <button
      type="button"
      onClick={(): void => {
        confirmDialog(options);
      }}
    >
      Open
    </button>
  );
};

const openAndSnapshot = async (
  options: Parameters<ReturnType<typeof useConfirm>>[0],
): Promise<{ baseElement: HTMLElement }> => {
  const user = userEvent.setup();
  const result = render(
    <ConfirmDialogProvider>
      <ConfirmDialogOpener options={options} />
    </ConfirmDialogProvider>,
  );

  await user.click(screen.getByRole('button', { name: 'Open' }));

  await waitFor((): void => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  return result;
};

describe('ConfirmDialog', () => {
  it('matches snapshot with default options', async () => {
    const { baseElement } = await openAndSnapshot({
      title: 'Confirm action',
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('matches snapshot with description', async () => {
    const { baseElement } = await openAndSnapshot({
      title: 'Delete item?',
      description: 'This action cannot be undone.',
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('matches snapshot with hideCancelButton', async () => {
    const { baseElement } = await openAndSnapshot({
      title: 'Please enter a list name',
      hideCancelButton: true,
      confirmationText: 'Ok',
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('matches snapshot with custom button texts', async () => {
    const { baseElement } = await openAndSnapshot({
      title: 'Reset progress?',
      description: 'All completed sets will be reset.',
      confirmationText: 'Reset',
      cancellationText: 'Keep',
    });
    expect(baseElement).toMatchSnapshot();
  });
});
