import type { UpdateWorkoutListDto, WorkoutList } from '@entities';
import { useNavigate } from '@tanstack/react-router';
import { FC } from 'react';

import { useConfirm } from '@shared';
import { NotFoundMessage, WorkoutListForm } from '@widgets';

type Props = {
  id: string;
  workout: WorkoutList | null | undefined;
  activeSessionId: string | null;
  updateWorkoutList: (id: string, dto: UpdateWorkoutListDto) => Promise<boolean>;
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

  return (
    <WorkoutListForm
      mode="edit"
      initialData={workout}
      onSubmit={(dto): void => {
        void (async (): Promise<void> => {
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

          const success = await updateWorkoutList(id, dto);
          if (!success) {
            // TODO: Support common toaster
            return;
          }

          if (shouldResync && activeSessionId) {
            await resyncSession(activeSessionId);
          }

          navigate({ to: '/' });
        })();
      }}
      onCancel={(): void => {
        navigate({ to: '/' });
      }}
    />
  );
};

export default EditWorkoutPageLogicLayer;
