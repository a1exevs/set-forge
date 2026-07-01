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
          const success = await updateWorkoutList(id, dto);
          if (!success) {
            // TODO: Support common toaster
            return;
          }

          if (activeSessionId) {
            const shouldResync = await confirmDialog({
              title: 'Also update the current session?',
              description: 'You have an active workout session for this list. Apply these changes to it as well?',
              confirmationText: 'Update session',
              cancellationText: 'Keep session',
            });
            if (shouldResync) {
              await resyncSession(activeSessionId);
            }
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
