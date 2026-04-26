import { DialogBackdrop, DialogPanel, Dialog as HeadlessDialog } from '@headlessui/react';
import { FC, MutableRefObject, ReactNode, RefObject } from 'react';

import classes from 'src/shared/ui/dialog/dialog.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  backdropColor?: string;
  disableAnimation?: boolean;
  initialFocus?: RefObject<HTMLElement | null> | MutableRefObject<HTMLElement | null>;
  ariaLabel?: string;
  ariaDescribedBy?: string;
};

/**
 * Dialog component built on Headless UI with overlay, backdrop, and animations
 * @example
 * ```typescript
 * <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
 *   <div>Dialog content</div>
 * </Dialog>
 * ```
 */
const DialogComponent: FC<Props> = ({
  open,
  onClose,
  children,
  backdropColor = '#000000',
  disableAnimation = false,
  initialFocus,
  ariaLabel,
  ariaDescribedBy,
}) => {
  return (
    <HeadlessDialog
      open={open}
      onClose={onClose}
      initialFocus={initialFocus}
      transition={!disableAnimation}
      className={classes.dialogRoot}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      <DialogBackdrop
        transition={!disableAnimation}
        className={classes.dialogBackdrop}
        style={{ backgroundColor: backdropColor }}
      />
      <div className={classes.dialogOverlay}>
        <DialogPanel transition={!disableAnimation} className={classes.dialogPanel}>
          {children}
        </DialogPanel>
      </div>
    </HeadlessDialog>
  );
};

export default DialogComponent;
