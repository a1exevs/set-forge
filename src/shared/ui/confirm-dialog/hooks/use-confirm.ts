import { useCallback, useContext } from 'react';

import { ConfirmContext, type ConfirmOptions } from 'src/shared/ui/confirm-dialog/contexts/confirm-dialog-context';

export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
  const context = useContext(ConfirmContext);

  if (context == null) {
    throw new Error('useConfirm must be used within ConfirmDialogProvider');
  }

  return useCallback(
    (options: ConfirmOptions): Promise<boolean> => context.openConfirm(options),
    [context.openConfirm],
  );
}
