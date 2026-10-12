import type { ConfirmOptions } from 'src/shared/lib';

type ConfirmAnswer = boolean | 'confirm' | 'alternate' | 'cancel';

/**
 * A `useConfirm()` mock that answers like the dialog provider: runs the action of the answer, resolves once it
 * succeeds and stays open — never resolves — when it fails. `confirmMock.mockImplementation(answerWith('confirm'))`.
 */
export const answerWith =
  (answer: ConfirmAnswer) =>
  async (options: ConfirmOptions): Promise<ConfirmAnswer> => {
    const action =
      answer === true || answer === 'confirm'
        ? options.onConfirm
        : answer === 'alternate'
          ? options.onAlternate
          : undefined;
    if (action) {
      try {
        await action();
      } catch {
        return new Promise<ConfirmAnswer>((): void => undefined);
      }
    }
    return answer;
  };
