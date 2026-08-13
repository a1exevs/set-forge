import { toast } from 'sonner';

export { toast };

export const toastSuccess = (message: string): void => {
  toast.success(message);
};

export const toastError = (error: unknown, fallback: string): void => {
  toast.error(error instanceof Error ? error.message : fallback);
};
