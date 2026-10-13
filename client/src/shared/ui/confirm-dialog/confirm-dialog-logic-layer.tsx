import type { FC } from 'react';
import { useCallback } from 'react';

import type { ConfirmOptions, ConfirmResult, Progress } from '@shared/lib';

import ConfirmDialog from './confirm-dialog';

type Props = {
  open: boolean;
  options: ConfirmOptions | null;
  onAnswer: (answer: ConfirmResult) => void;
  progressOf: (answer: ConfirmResult) => Progress;
};

const ConfirmDialogLogicLayer: FC<Props> = ({ open, options, onAnswer, progressOf }) => {
  const handleConfirm = useCallback((): void => onAnswer('confirm'), [onAnswer]);
  const handleAlternate = useCallback((): void => onAnswer('alternate'), [onAnswer]);
  const handleDismiss = useCallback((): void => onAnswer('cancel'), [onAnswer]);

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
      confirmProgress={progressOf('confirm')}
      alternateProgress={progressOf('alternate')}
      cancelProgress={progressOf('cancel')}
      onConfirm={handleConfirm}
      onAlternate={handleAlternate}
      onCancel={handleDismiss}
      onClose={handleDismiss}
      ariaLabel={ariaLabel}
    />
  );
};

export default ConfirmDialogLogicLayer;
