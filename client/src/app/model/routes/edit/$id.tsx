import { createFileRoute, useParams } from '@tanstack/react-router';
import { FC } from 'react';

import { EditWorkoutPage } from '@pages';

const EditWorkoutRoute: FC = () => {
  const { id } = useParams({ from: '/edit/$id' });
  return <EditWorkoutPage id={id} />;
};

export const Route = createFileRoute('/edit/$id')({
  component: EditWorkoutRoute,
});
