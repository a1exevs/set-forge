import { useNavigate } from '@tanstack/react-router';
import { FC } from 'react';

import {
  emailToAvatarLetter,
  useCurrentUserQuery,
  useDeleteWorkoutListMutation,
  useLogoutMutation,
  useWorkoutListsQuery,
} from '@entities';
import { formatDate } from '@shared';

import HomePageLogicLayer from 'src/pages/home/ui/home-page-logic-layer';

const HomePageDataLayer: FC = () => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUserQuery(true);
  const { data: workoutLists = [] } = useWorkoutListsQuery(Boolean(user));
  const deleteWorkoutListMutation = useDeleteWorkoutListMutation();
  const logoutMutation = useLogoutMutation();

  const userEmail = user?.email ?? '';
  const avatarLetter = user ? emailToAvatarLetter(user.email) : '?';

  return (
    <HomePageLogicLayer
      workoutLists={workoutLists}
      deleteWorkoutList={async (id): Promise<void> => {
        await deleteWorkoutListMutation.mutateAsync(id);
      }}
      onEdit={(id): void => {
        navigate({ to: '/edit/$id', params: { id } });
      }}
      formatDate={formatDate}
      userEmail={userEmail}
      avatarLetter={avatarLetter}
      onLogout={(): void => {
        logoutMutation.mutate();
      }}
    />
  );
};

export default HomePageDataLayer;
