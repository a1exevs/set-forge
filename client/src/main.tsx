import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { queryClient, router } from '@app';
import { ConfirmDialogProvider, Toaster } from '@shared';

import { clearAccessToken, setSessionExpiredHandler } from 'src/shared/api';

import 'src/shared/ui/styles/global.scss';

setSessionExpiredHandler(() => {
  clearAccessToken();
  queryClient.clear();
  void router.navigate({ to: '/login' });
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfirmDialogProvider>
        <RouterProvider router={router} context={{ queryClient }} />
        <Toaster />
      </ConfirmDialogProvider>
    </QueryClientProvider>
  </StrictMode>,
);
