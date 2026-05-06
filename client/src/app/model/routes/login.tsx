import { createFileRoute } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import { AuthPageDataLayer } from '@pages';

const validateSearch = (raw: Record<string, unknown>): { redirect?: string } => ({
  redirect: typeof raw.redirect === 'string' ? raw.redirect : undefined,
});

export const Route = createFileRoute('/login')({
  validateSearch,
  component: LoginRoutePage,
});

function LoginRoutePage(): ReactElement {
  const search = Route.useSearch();
  return <AuthPageDataLayer activeTab="login" redirectSearch={search} />;
}
