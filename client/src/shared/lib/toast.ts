import { toast } from 'sonner';

export const toastSuccess = (message: string): void => {
  toast.success(message);
};

/** The message is ready to show: the caller translates it (a server error through `apiErrorText`). */
export const toastError = (message: string): void => {
  toast.error(message);
};
