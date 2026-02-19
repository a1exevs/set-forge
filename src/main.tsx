import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Providers } from '@app';
import { HomePage } from '@pages';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <Providers>
      <HomePage />
    </Providers>
  </StrictMode>,
);
