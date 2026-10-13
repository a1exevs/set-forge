import type { FC, ReactNode } from 'react';

import type { Progress } from '@shared/lib';

import classes from './confirm-dialog.module.scss';
import Button from '../button/button';
import Dialog from '../dialog/dialog';

type Props = {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmationText: string;
  cancellationText: string;
  alternateText?: string;
  hideCancelButton: boolean;
  confirmProgress: Progress;
  alternateProgress: Progress;
  cancelProgress: Progress;
  onConfirm: () => void;
  onAlternate: () => void;
  onCancel: () => void;
  onClose: () => void;
  ariaLabel: string;
};

const ConfirmDialog: FC<Props> = ({
  open,
  title,
  description,
  confirmationText,
  cancellationText,
  alternateText,
  hideCancelButton,
  confirmProgress,
  alternateProgress,
  cancelProgress,
  onConfirm,
  onAlternate,
  onCancel,
  onClose,
  ariaLabel,
}) => {
  if (!open) {
    return null;
  }

  const hasAlternate = alternateText != null && alternateText.length > 0;

  return (
    <Dialog open={open} onClose={onClose} disableAnimation={true} ariaLabel={ariaLabel}>
      <div className={classes.container}>
        <h2 className={classes.title}>{title}</h2>
        {description != null && <p className={classes.description}>{description}</p>}
        <div
          className={`${classes.buttons} ${hideCancelButton && !hasAlternate ? classes.singleButton : ''} ${hasAlternate ? classes.multiButton : ''}`}
        >
          {!hideCancelButton && (
            <Button variant="secondary" progress={cancelProgress} onClick={onCancel}>
              {cancellationText}
            </Button>
          )}
          {hasAlternate && (
            <Button variant="secondary" progress={alternateProgress} onClick={onAlternate}>
              {alternateText}
            </Button>
          )}
          <Button variant="primary" progress={confirmProgress} onClick={onConfirm}>
            {confirmationText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;
