import { createContext, ReactNode } from 'react';

export type ConfirmOptions = {
  title: ReactNode;
  description?: ReactNode;
  confirmationText?: string;
  cancellationText?: string;
  hideCancelButton?: boolean;
};

export type ConfirmContextValue = {
  openConfirm: (options: ConfirmOptions) => Promise<boolean>;
};

export const ConfirmContext = createContext<ConfirmContextValue | null>(null);
