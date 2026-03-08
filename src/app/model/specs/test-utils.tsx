import { createRouter, RouterProvider } from '@tanstack/react-router';
import { render } from '@testing-library/react';

import { ConfirmDialogProvider } from '@shared';

export const renderApp = (router: ReturnType<typeof createRouter>): ReturnType<typeof render> =>
  render(
    <ConfirmDialogProvider>
      <RouterProvider router={router} />
    </ConfirmDialogProvider>,
  );
