import type { FC } from 'react';
import { useCallback } from 'react';

import type { ConfirmOptions, ConfirmResult } from '@shared/lib';

import ConfirmDialog from './confirm-dialog';

type Props = {
  open: boolean;
  options: ConfirmOptions | null;
  onClose: (value: boolean | ConfirmResult) => void;
};

const ConfirmDialogLogicLayer: FC<Props> = ({ open, options, onClose }) => {
  const handleConfirm = useCallback((): void => {
    onClose(options?.alternateText != null ? 'confirm' : true);
  }, [onClose, options?.alternateText]);

  const handleAlternate = useCallback((): void => {
    onClose('alternate');
  }, [onClose]);

  const handleDismiss = useCallback((): void => {
    onClose(options?.alternateText != null ? 'cancel' : false);
  }, [onClose, options?.alternateText]);

  if (!open || options == null) {
    return null;
  }

  const confirmationText = options.confirmationText ?? 'Confirm';
  const cancellationText = options.cancellationText ?? 'Cancel';
  const hideCancelButton = options.hideCancelButton ?? false;
  const ariaLabel = typeof options.title === 'string' ? options.title : 'Confirmation dialog';

  return (
    <ConfirmDialog
      open={open}
      title={options.title}
      description={options.description}
      confirmationText={confirmationText}
      cancellationText={cancellationText}
      alternateText={options.alternateText}
      hideCancelButton={hideCancelButton}
      onConfirm={handleConfirm}
      onAlternate={handleAlternate}
      onCancel={handleDismiss}
      onClose={handleDismiss}
      ariaLabel={ariaLabel}
    />
  );
};

export default ConfirmDialogLogicLayer;
