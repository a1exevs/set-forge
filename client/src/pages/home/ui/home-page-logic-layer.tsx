import type { WorkoutList } from '@entities';
import { FC } from 'react';

import { useConfirm } from '@shared';

import HomePage from 'src/pages/home/ui/home-page';

type Props = {
  workoutLists: WorkoutList[];
  deleteWorkoutList: (id: string) => Promise<void>;
  onEdit: (id: string) => void;
  formatDate: (date: string | null) => string;
  userEmail: string;
  avatarLetter: string;
  onLogout: () => void | Promise<void>;
};

const HomePageLogicLayer: FC<Props> = ({
  workoutLists,
  deleteWorkoutList,
  onEdit,
  formatDate,
  userEmail,
  avatarLetter,
  onLogout,
}) => {
  const confirmDialog = useConfirm();

  const handleDelete = async (id: string, name: string): Promise<void> => {
    const ok = await confirmDialog({
      title: 'Delete workout list?',
      description: `Delete "${name}"? This cannot be undone.`,
      confirmationText: 'Delete',
      cancellationText: 'Cancel',
    });
    if (ok) {
      await deleteWorkoutList(id);
    }
  };

  return (
    <HomePage
      workoutLists={workoutLists}
      onEdit={onEdit}
      onDelete={handleDelete}
      formatDate={formatDate}
      userEmail={userEmail}
      avatarLetter={avatarLetter}
      onLogout={onLogout}
    />
  );
};

export default HomePageLogicLayer;
