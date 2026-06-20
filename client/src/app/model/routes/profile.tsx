import { createFileRoute } from '@tanstack/react-router';

import { ProfilePage } from '@pages';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});
