import { render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';

import { toastError, toastSuccess } from 'src/shared/ui/toaster/toast';
import Toaster from 'src/shared/ui/toaster/toaster';

describe('toast helpers', () => {
  afterEach((): void => {
    jest.restoreAllMocks();
    toast.dismiss();
  });

  it('toastSuccess calls toast.success with the message', () => {
    const successSpy = jest.spyOn(toast, 'success').mockImplementation((): string | number => 'ok');

    toastSuccess('Workout list created');

    expect(successSpy).toHaveBeenCalledWith('Workout list created');
  });

  it('toastError uses Error.message when error is an Error', () => {
    const errorSpy = jest.spyOn(toast, 'error').mockImplementation((): string | number => 'err');

    toastError(new Error('Server unavailable'), 'Failed to create workout list');

    expect(errorSpy).toHaveBeenCalledWith('Server unavailable');
  });

  it('toastError uses fallback when error is not an Error', () => {
    const errorSpy = jest.spyOn(toast, 'error').mockImplementation((): string | number => 'err');

    toastError('network', 'Failed to create workout list');

    expect(errorSpy).toHaveBeenCalledWith('Failed to create workout list');
  });
});

describe('Toaster', () => {
  afterEach((): void => {
    toast.dismiss();
  });

  it('renders sonner toaster at bottom-left when a toast is shown', async () => {
    render(<Toaster />);
    toastSuccess('Workout list created');

    await waitFor((): void => {
      const toaster = document.querySelector('[data-sonner-toaster]');
      expect(toaster).toBeInTheDocument();
      expect(toaster).toHaveAttribute('data-y-position', 'bottom');
      expect(toaster).toHaveAttribute('data-x-position', 'left');
    });
  });

  it('shows a success toast when toastSuccess is called', async () => {
    render(<Toaster />);

    toastSuccess('Workout list created');

    await waitFor((): void => {
      expect(screen.getByText('Workout list created')).toBeInTheDocument();
    });
  });

  it('shows an error toast when toastError is called', async () => {
    render(<Toaster />);

    toastError(new Error('Something went wrong'), 'Failed');

    await waitFor((): void => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
});
