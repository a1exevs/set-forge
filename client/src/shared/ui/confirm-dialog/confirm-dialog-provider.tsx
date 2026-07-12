import { FC, PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';

import ConfirmDialogLogicLayer from 'src/shared/ui/confirm-dialog/confirm-dialog-logic-layer';
import {
  ConfirmContext,
  type ConfirmOptions,
  type ConfirmResult,
} from 'src/shared/ui/confirm-dialog/contexts/confirm-dialog-context';

const ConfirmDialogProvider: FC<PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean | ConfirmResult) => void) | null>(null);

  const openConfirm = useCallback((opts: ConfirmOptions): Promise<boolean | ConfirmResult> => {
    return new Promise<boolean | ConfirmResult>((resolve): void => {
      // TODO Maybe support dialogs queue
      if (resolveRef.current) {
        resolveRef.current(false);
        resolveRef.current = null;
      }
      resolveRef.current = resolve;
      setOptions(opts);
      setOpen(true);
    });
  }, []);

  const handleClose = useCallback((value: boolean | ConfirmResult): void => {
    setOpen(false);
    if (resolveRef.current) {
      resolveRef.current(value);
      resolveRef.current = null;
    }
    setOptions(null);
  }, []);

  const contextValue = useMemo(() => ({ openConfirm }), [openConfirm]);

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}
      <ConfirmDialogLogicLayer open={open} options={options} onClose={handleClose} />
    </ConfirmContext.Provider>
  );
};

export default ConfirmDialogProvider;
