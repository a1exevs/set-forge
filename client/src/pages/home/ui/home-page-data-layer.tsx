import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { FC } from 'react';

import {
  clearWorkoutSessionCachesForDeletedList,
  useCurrentUserQuery,
  useDeleteWorkoutListMutation,
  useExportAllWorkoutListsMutation,
  useImportWorkoutListsMutation,
  useWorkoutListsQuery,
} from '@entities';
import { formatDate } from '@shared';

import HomePageLogicLayer from 'src/pages/home/ui/home-page-logic-layer';

const HomePageDataLayer: FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUserQuery(true);
  const { data: workoutLists = [] } = useWorkoutListsQuery(Boolean(user));
  const deleteWorkoutListMutation = useDeleteWorkoutListMutation();
  const exportAllWorkoutListsMutation = useExportAllWorkoutListsMutation();
  const importWorkoutListsMutation = useImportWorkoutListsMutation();
  return (
    <HomePageLogicLayer
      workoutLists={workoutLists}
      deleteWorkoutList={async (id): Promise<void> => {
        await deleteWorkoutListMutation.mutateAsync(id);
      }}
      clearWorkoutSessionCachesForDeletedList={(workoutListId): void => {
        clearWorkoutSessionCachesForDeletedList(queryClient, workoutListId);
      }}
      exportAllWorkoutLists={async () => exportAllWorkoutListsMutation.mutateAsync()}
      importWorkoutLists={async (file): Promise<void> => {
        await importWorkoutListsMutation.mutateAsync(file);
      }}
      onEdit={(id): void => {
        navigate({ to: '/edit/$id', params: { id } });
      }}
      formatDate={formatDate}
    />
  );
};

export default HomePageDataLayer;
