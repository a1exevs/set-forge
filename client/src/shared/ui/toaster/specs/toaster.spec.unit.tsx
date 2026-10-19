import { render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';

import { toastError, toastSuccess } from '@shared/lib';

import Toaster from '../toaster-data-layer';

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

  it('toastError calls toast.error with the message', () => {
    const errorSpy = jest.spyOn(toast, 'error').mockImplementation((): string | number => 'err');

    toastError('Нет связи с сервером');

    expect(errorSpy).toHaveBeenCalledWith('Нет связи с сервером');
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

    toastError('Something went wrong');

    await waitFor((): void => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
});
