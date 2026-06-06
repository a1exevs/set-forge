import { useNavigate } from '@tanstack/react-router';
import { FC } from 'react';

import { emailToAvatarLetter, useCurrentUserQuery, useLogoutMutation, useWorkoutListStore } from '@entities';
import { formatDate } from '@shared';

import HomePageLogicLayer from 'src/pages/home/ui/home-page-logic-layer';

const HomePageDataLayer: FC = () => {
  const navigate = useNavigate();
  const workoutLists = useWorkoutListStore.use.workoutLists();
  const loadLists = useWorkoutListStore.use.loadLists();
  const deleteWorkoutList = useWorkoutListStore.use.deleteWorkoutList();
  const { data: user } = useCurrentUserQuery(true);
  const logoutMutation = useLogoutMutation();

  const userEmail = user?.email ?? '';
  const avatarLetter = user ? emailToAvatarLetter(user.email) : '?';

  return (
    <HomePageLogicLayer
      workoutLists={workoutLists}
      deleteWorkoutList={deleteWorkoutList}
      onEdit={(id): void => {
        navigate({ to: '/edit/$id', params: { id } });
      }}
      formatDate={formatDate}
      loadLists={loadLists}
      userEmail={userEmail}
      avatarLetter={avatarLetter}
      onLogout={(): void => {
        logoutMutation.mutate();
      }}
    />
  );
};

export default HomePageDataLayer;
