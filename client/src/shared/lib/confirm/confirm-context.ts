import { createContext, ReactNode } from 'react';

export type ConfirmResult = 'confirm' | 'cancel' | 'alternate';

// A shown Cancel needs its text; shared/ui has no texts of its own.
type CancelButton =
  | { hideCancelButton: true; cancellationText?: never }
  | { hideCancelButton?: false; cancellationText: string };

export type ConfirmOptions = CancelButton & {
  /** Also the accessible name of the dialog. */
  title: string;
  description?: ReactNode;
  confirmationText: string;
  alternateText?: string;
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
