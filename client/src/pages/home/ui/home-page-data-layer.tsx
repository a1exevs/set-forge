import { useNavigate } from '@tanstack/react-router';
import { FC } from 'react';

import { useCurrentUserQuery } from '@entities/session';
import {
  useDeleteWorkoutListMutation,
  useExportAllWorkoutListsMutation,
  useImportWorkoutListsMutation,
  useWorkoutListsQuery,
  type WorkoutListsExportFile,
} from '@entities/workout-list';
import { useClearWorkoutSessionCachesForDeletedList } from '@entities/workout-session';
import { formatDate } from '@shared/lib';

import HomePageLogicLayer from './home-page-logic-layer';

const HomePageDataLayer: FC = () => {
  const navigate = useNavigate();
  const clearWorkoutSessionCachesForDeletedList = useClearWorkoutSessionCachesForDeletedList();
  const { data: user } = useCurrentUserQuery(true);
  const { data: workoutLists = [], isLoading } = useWorkoutListsQuery(Boolean(user));
  const deleteWorkoutListMutation = useDeleteWorkoutListMutation();
  const exportAllWorkoutListsMutation = useExportAllWorkoutListsMutation();
  const importWorkoutListsMutation = useImportWorkoutListsMutation();
  return (
    <HomePageLogicLayer
      workoutLists={workoutLists}
      isLoading={isLoading}
      deleteWorkoutList={async (id: string): Promise<void> => {
        await deleteWorkoutListMutation.mutateAsync(id);
      }}
      clearWorkoutSessionCachesForDeletedList={clearWorkoutSessionCachesForDeletedList}
      exportAllWorkoutLists={async (): Promise<WorkoutListsExportFile> => exportAllWorkoutListsMutation.mutateAsync()}
      importWorkoutLists={async (file: WorkoutListsExportFile): Promise<void> => {
        await importWorkoutListsMutation.mutateAsync(file);
      }}
      onEdit={(id: string): void => {
        navigate({ to: '/edit/$id', params: { id } });
      }}
      formatDate={formatDate}
    />
  );
};

export default HomePageDataLayer;
