import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { clearAccessToken, setSessionExpiredHandler } from '@shared/api';
import { initI18n } from '@shared/lib';
import { ConfirmDialogProvider } from '@shared/ui';

import AppToaster from './app-toaster';
import { queryClient } from '../api/query-client';
import { dictionaries } from '../i18n/dictionaries';
import { router } from '../router/router';
import '../styles/global.scss';

initI18n(dictionaries);

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
        <AppToaster />
      </ConfirmDialogProvider>
    </QueryClientProvider>
  </StrictMode>,
);
