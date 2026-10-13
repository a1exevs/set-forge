import { createContext, ReactNode } from 'react';

export type ConfirmResult = 'confirm' | 'cancel' | 'alternate';

export type ConfirmOptions = {
  title: ReactNode;
  description?: ReactNode;
  confirmationText?: string;
  cancellationText?: string;
  alternateText?: string;
  hideCancelButton?: boolean;
  /**
   * The request behind Confirm. The dialog stays open with Confirm in progress until it settles: resolved → the
   * dialog closes and the answer resolves; rejected → the dialog stays open for a retry or Cancel — the action
   * reports its own error.
   */
  onConfirm?: () => Promise<unknown>;
  /** The request behind the alternate button, with the same contract as `onConfirm`. */
  onAlternate?: () => Promise<unknown>;
};

export type ConfirmContextValue = {
  openConfirm: (options: ConfirmOptions) => Promise<boolean | ConfirmResult>;
};

export const ConfirmContext = createContext<ConfirmContextValue | null>(null);
