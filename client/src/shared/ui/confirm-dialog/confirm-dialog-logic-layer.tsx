import type { FC } from 'react';
import { useCallback } from 'react';

import ConfirmDialog from 'src/shared/ui/confirm-dialog/confirm-dialog';
import type { ConfirmOptions } from 'src/shared/ui/confirm-dialog/contexts/confirm-dialog-context';

const DEFAULT_CONFIRMATION_TEXT = 'Confirm';
const DEFAULT_CANCELLATION_TEXT = 'Cancel';

type Props = {
  open: boolean;
  options: ConfirmOptions | null;
  onClose: (value: boolean) => void;
};

const ConfirmDialogLogicLayer: FC<Props> = ({ open, options, onClose }) => {
  const handleConfirm = useCallback((): void => {
    onClose(true);
  }, [onClose]);

  const handleDismiss = useCallback((): void => {
    onClose(false);
  }, [onClose]);

  if (!open || options == null) {
    return null;
  }

  const confirmationText = options.confirmationText ?? DEFAULT_CONFIRMATION_TEXT;
  const cancellationText = options.cancellationText ?? DEFAULT_CANCELLATION_TEXT;
  const hideCancelButton = options.hideCancelButton ?? false;
  const ariaLabel = typeof options.title === 'string' ? options.title : 'Confirmation dialog';

  return (
    <ConfirmDialog
      open={open}
      title={options.title}
      description={options.description}
      confirmationText={confirmationText}
      cancellationText={cancellationText}
      hideCancelButton={hideCancelButton}
      onConfirm={handleConfirm}
      onCancel={handleDismiss}
      onClose={handleDismiss}
      ariaLabel={ariaLabel}
    />
  );
};

export default ConfirmDialogLogicLayer;
