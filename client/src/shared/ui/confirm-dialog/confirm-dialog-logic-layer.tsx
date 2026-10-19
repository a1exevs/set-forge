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

  // Empty only while closed: an open dialog always has its options
  const title = options?.title ?? '';
  const hideCancelButton = options?.hideCancelButton ?? false;

  return (
    <ConfirmDialog
      open={open && options != null}
      title={title}
      description={options?.description}
      confirmationText={options?.confirmationText ?? ''}
      cancellationText={options?.cancellationText ?? ''}
      alternateText={options?.alternateText}
      hideCancelButton={hideCancelButton}
      confirmProgress={progressOf('confirm')}
      alternateProgress={progressOf('alternate')}
      cancelProgress={progressOf('cancel')}
      onConfirm={handleConfirm}
      onAlternate={handleAlternate}
      onCancel={handleDismiss}
      onClose={handleDismiss}
      ariaLabel={title}
    />
  );
};

export default ConfirmDialogLogicLayer;
