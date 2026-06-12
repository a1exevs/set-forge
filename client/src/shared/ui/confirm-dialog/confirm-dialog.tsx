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
  hideCancelButton: boolean;
  onConfirm: () => void;
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
  hideCancelButton,
  onConfirm,
  onCancel,
  onClose,
  ariaLabel,
}) => {
  return (
    <Dialog open={open} onClose={onClose} disableAnimation={true} ariaLabel={ariaLabel}>
      <div className={classes.container}>
        <h2 className={classes.title}>{title}</h2>
        {description != null && <p className={classes.description}>{description}</p>}
        <div className={`${classes.buttons} ${hideCancelButton ? classes.singleButton : ''}`}>
          {!hideCancelButton && (
            <Button variant="secondary" onClick={onCancel}>
              {cancellationText}
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
