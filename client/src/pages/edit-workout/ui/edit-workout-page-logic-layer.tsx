import type { UpdateWorkoutListDto, WorkoutList } from '@entities';
import { useNavigate } from '@tanstack/react-router';
import { FC } from 'react';

import { toastError, toastSuccess, useConfirm } from '@shared';
import { NotFoundMessage, WorkoutListForm } from '@widgets';

type Props = {
  id: string;
  workout: WorkoutList | null | undefined;
  activeSessionId: string | null;
  updateWorkoutList: (id: string, dto: UpdateWorkoutListDto) => Promise<void>;
  resyncSession: (sessionId: string) => Promise<void>;
};

const EditWorkoutPageLogicLayer: FC<Props> = ({ id, workout, activeSessionId, updateWorkoutList, resyncSession }) => {
  const navigate = useNavigate();
  const confirmDialog = useConfirm();

  if (workout === undefined) {
    return null;
  }

  // TODO: Distinguish query errors from a missing list — not only "Workout list not found" (see data layer)
  if (workout === null) {
    return <NotFoundMessage title="Workout list not found" />;
  }

  const onSubmit = async (dto: UpdateWorkoutListDto): Promise<void> => {
    let shouldResync = false;

    if (activeSessionId) {
      const result = await confirmDialog({
        title: 'Also update the current session?',
        description:
          'Update session saves the list and applies these changes to the active workout. Keep session saves the list only. Cancel returns to editing.',
        confirmationText: 'Update session',
        alternateText: 'Keep session',
        cancellationText: 'Cancel',
      });

      if (result === 'cancel') {
        return;
      }

      shouldResync = result === 'confirm';
    }

    try {
      await updateWorkoutList(id, dto);
    } catch (error: unknown) {
      toastError(error, 'Failed to update workout list');
      return;
    }

    if (shouldResync && activeSessionId) {
      try {
        await resyncSession(activeSessionId);
      } catch (error: unknown) {
        toastError(error, 'Failed to update the current session');
        return;
      }
    }

    toastSuccess('Workout list updated');
    navigate({ to: '/' });
  };

  return (
    <WorkoutListForm
      mode="edit"
      initialData={workout}
      onSubmit={onSubmit}
      onCancel={(): void => {
        navigate({ to: '/' });
      }}
    />
  );
};

export default EditWorkoutPageLogicLayer;
