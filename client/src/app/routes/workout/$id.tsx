import { createFileRoute, useParams } from '@tanstack/react-router';
import { FC } from 'react';

import { WorkoutModePage } from '@pages/workout-mode';

const WorkoutModeRoute: FC = () => {
  const { id } = useParams({ from: '/workout/$id' });
  return <WorkoutModePage id={id} />;
};

export const Route = createFileRoute('/workout/$id')({
  component: WorkoutModeRoute,
});
