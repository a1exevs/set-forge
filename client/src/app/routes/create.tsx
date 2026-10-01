import { createFileRoute } from '@tanstack/react-router';

import { CreateWorkoutPage } from '@pages/create-workout';

export const Route = createFileRoute('/create')({
  component: CreateWorkoutPage,
});
