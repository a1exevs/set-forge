import { createFileRoute } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import { AuthPage } from '@pages';

const validateSearch = (raw: Record<string, unknown>): { redirect?: string } => ({
  redirect: typeof raw.redirect === 'string' ? raw.redirect : undefined,
});

export const Route = createFileRoute('/register')({
  validateSearch,
  component: RegisterRoutePage,
});

function RegisterRoutePage(): ReactElement {
  const search = Route.useSearch();
  return <AuthPage activeTab="register" redirectSearch={search} />;
}
