import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useWorkoutListStore } from '@entities';

const RootComponent = (): JSX.Element => {
  const loadFromStorage = useWorkoutListStore.use.loadFromStorage();
  const workoutLists = useWorkoutListStore.use.workoutLists();

  useEffect((): void => {
    if (workoutLists.length === 0) {
      loadFromStorage();
    }
  }, [loadFromStorage, workoutLists.length]);

  return <Outlet />;
};

export const Route = createRootRoute({
  component: RootComponent,
});
