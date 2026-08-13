import { render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';

import { toastError, toastSuccess } from 'src/shared/ui/toaster/toast';
import Toaster from 'src/shared/ui/toaster/toaster';

const showAndSnapshot = async (show: () => void): Promise<{ baseElement: HTMLElement }> => {
  const result = render(<Toaster />);
  show();

  await waitFor((): void => {
    expect(document.querySelector('[data-sonner-toast]')).toBeInTheDocument();
  });

  return result;
};

describe('Toaster', () => {
  afterEach((): void => {
    toast.dismiss();
  });

  it('matches snapshot for success toast', async () => {
    const { baseElement } = await showAndSnapshot((): void => {
      toastSuccess('Workout list created');
    });

    await waitFor((): void => {
      expect(screen.getByText('Workout list created')).toBeInTheDocument();
    });

    expect(baseElement).toMatchSnapshot();
  });

  it('matches snapshot for error toast', async () => {
    const { baseElement } = await showAndSnapshot((): void => {
      toastError(new Error('Failed to update workout list'), 'Failed');
    });

    await waitFor((): void => {
      expect(screen.getByText('Failed to update workout list')).toBeInTheDocument();
    });

    expect(baseElement).toMatchSnapshot();
  });

  it('matches snapshot for fallback error toast', async () => {
    const { baseElement } = await showAndSnapshot((): void => {
      toastError(null, 'Failed to start workout session');
    });

    await waitFor((): void => {
      expect(screen.getByText('Failed to start workout session')).toBeInTheDocument();
    });

    expect(baseElement).toMatchSnapshot();
  });
});
