import { render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';

import { toastError, toastSuccess } from '@shared/lib';

import Toaster from '../toaster-data-layer';

const showAndSnapshot = async (show: () => void): Promise<{ baseElement: HTMLElement }> => {
  const result = render(<Toaster ariaLabel="Notifications" />);
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
      toastError('Failed to update workout list');
    });

    await waitFor((): void => {
      expect(screen.getByText('Failed to update workout list')).toBeInTheDocument();
    });

    expect(baseElement).toMatchSnapshot();
  });
});
