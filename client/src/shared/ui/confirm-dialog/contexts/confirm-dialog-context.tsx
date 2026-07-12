import { createContext, ReactNode } from 'react';

export type ConfirmResult = 'confirm' | 'cancel' | 'alternate';

export type ConfirmOptions = {
  title: ReactNode;
  description?: ReactNode;
  confirmationText?: string;
  cancellationText?: string;
  alternateText?: string;
  hideCancelButton?: boolean;
};

export type ConfirmContextValue = {
  openConfirm: (options: ConfirmOptions) => Promise<boolean | ConfirmResult>;
};

export const ConfirmContext = createContext<ConfirmContextValue | null>(null);
