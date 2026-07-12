import type { FC, ReactNode } from 'react';

import Button from 'src/shared/ui/button/button';
import classes from 'src/shared/ui/confirm-dialog/confirm-dialog.module.scss';
import Dialog from 'src/shared/ui/dialog/dialog';

type Props = {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmationText: string;
  cancellationText: string;
  alternateText?: string;
  hideCancelButton: boolean;
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
  onConfirm,
  onAlternate,
  onCancel,
  onClose,
  ariaLabel,
}) => {
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
            <Button variant="secondary" onClick={onCancel}>
              {cancellationText}
            </Button>
          )}
          {hasAlternate && (
            <Button variant="secondary" onClick={onAlternate}>
              {alternateText}
            </Button>
          )}
          <Button variant="primary" onClick={onConfirm}>
            {confirmationText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;
