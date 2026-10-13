import { FC, PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';

import { ConfirmContext, type ConfirmOptions, type ConfirmResult, useProgress } from '@shared/lib';

import ConfirmDialogLogicLayer from './confirm-dialog-logic-layer';

const ConfirmDialogProvider: FC<PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean | ConfirmResult) => void) | null>(null);
  // `cancel` never runs: it only reads `locked` while an action is in flight.
  const { run, progressOf, busy } = useProgress<ConfirmResult>();

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

  const close = useCallback((answer: ConfirmResult, withAlternate: boolean): void => {
    setOpen(false);
    if (resolveRef.current) {
      resolveRef.current(withAlternate ? answer : answer === 'confirm');
      resolveRef.current = null;
    }
    setOptions(null);
  }, []);

  const handleAnswer = useCallback(
    (answer: ConfirmResult): void => {
      // Cancel, Esc and a click outside wait for the request in flight
      if (busy || options == null) {
        return;
      }
      const withAlternate = options.alternateText != null;
      const action = answer === 'confirm' ? options.onConfirm : answer === 'alternate' ? options.onAlternate : null;
      if (action == null) {
        close(answer, withAlternate);
        return;
      }
      run(answer, action)
        .then((done: boolean): void => {
          if (done) {
            close(answer, withAlternate);
          }
        })
        // A failed action keeps the dialog open; the action has shown its error.
        .catch((): void => undefined);
    },
    [busy, close, options, run],
  );

  const contextValue = useMemo(() => ({ openConfirm }), [openConfirm]);

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}
      <ConfirmDialogLogicLayer open={open} options={options} onAnswer={handleAnswer} progressOf={progressOf} />
    </ConfirmContext.Provider>
  );
};

export default ConfirmDialogProvider;
