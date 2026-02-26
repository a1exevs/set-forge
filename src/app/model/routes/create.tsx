import { createFileRoute } from '@tanstack/react-router';

import { CreateWorkoutPage } from '@pages';

export const Route = createFileRoute('/create')({
  component: CreateWorkoutPage,
});
