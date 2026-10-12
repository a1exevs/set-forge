import { useNavigate } from '@tanstack/react-router';
import { FC } from 'react';

import type { UpdateWorkoutListDto, WorkoutList } from '@entities/workout-list';
import { toastError, toastSuccess, useConfirm, useLoadingPhase, useProgress } from '@shared/lib';
import { NotFoundMessage } from '@shared/ui';
import { WorkoutListForm, WorkoutListFormSkeleton } from '@widgets/workout-list-form';

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
  const { run, progressOf } = useProgress<'save'>();
  const loadingPhase = useLoadingPhase(workout === undefined);

  if (loadingPhase === 'skeleton') {
    return <WorkoutListFormSkeleton />;
  }
  // The first 300 ms of loading: a list that comes sooner shows with no skeleton
  if (workout === undefined) {
    return null;
  }

  // TODO: Distinguish query errors from a missing list — not only "Workout list not found" (see data layer)
  if (workout === null) {
    return <NotFoundMessage title="Workout list not found" />;
  }

  // Rejects after its toast, so the button or the dialog that runs it goes back to normal and the user stays.
  const save = async (dto: UpdateWorkoutListDto, resyncSessionId: string | null): Promise<void> => {
    try {
      await updateWorkoutList(id, dto);
    } catch (error: unknown) {
      toastError(error, 'Failed to update workout list');
      throw error;
    }

    if (resyncSessionId) {
      try {
        await resyncSession(resyncSessionId);
      } catch (error: unknown) {
        toastError(error, 'Failed to update the current session');
        throw error;
      }
    }
  };

  const onSubmit = async (dto: UpdateWorkoutListDto): Promise<void> => {
    if (activeSessionId) {
      const result = await confirmDialog({
        title: 'Also update the current session?',
        description:
          'Update session saves the list and applies these changes to the active workout. Keep session saves the list only. Cancel returns to editing.',
        confirmationText: 'Update session',
        alternateText: 'Keep session',
        cancellationText: 'Cancel',
        onConfirm: () => save(dto, activeSessionId),
        onAlternate: () => save(dto, null),
      });

      if (result === 'cancel') {
        return;
      }
    } else {
      try {
        if (!(await run('save', () => save(dto, null)))) {
          return;
        }
      } catch {
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
      submitProgress={progressOf('save')}
      onSubmit={(dto: UpdateWorkoutListDto): void => void onSubmit(dto)}
      onCancel={(): void => {
        navigate({ to: '/' });
      }}
    />
  );
};

export default EditWorkoutPageLogicLayer;
