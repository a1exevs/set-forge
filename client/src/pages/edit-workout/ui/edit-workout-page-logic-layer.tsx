import { useNavigate } from '@tanstack/react-router';
import { FC, useState } from 'react';

import type { UpdateWorkoutListDto, WorkoutList } from '@entities/workout-list';
import { apiErrorText } from '@shared/api';
import { toastError, toastSuccess, useConfirm, useLoadingPhase, useProgress, useT } from '@shared/lib';
import { formServerErrors } from '@widgets/workout-list-form';

import EditWorkoutPage from './edit-workout-page';

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
  const { t } = useT();
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>();
  const loadingPhase = useLoadingPhase(workout === undefined);

  // Rejects after its toast, so the action that runs it ends and the user stays.
  const save = async (dto: UpdateWorkoutListDto, resyncSessionId: string | null): Promise<void> => {
    try {
      await updateWorkoutList(id, dto);
    } catch (error: unknown) {
      // The form shows what it has a field for; the rest, or a failure without errors, goes to the toast.
      const { fields, others } = formServerErrors(error, t);
      setServerFieldErrors(fields);
      if (others.length > 0) {
        toastError(others.join(' '));
      } else if (Object.keys(fields).length === 0) {
        toastError(t('workoutList.toasts.updateFailed'));
      }
      throw error;
    }

    if (resyncSessionId) {
      try {
        await resyncSession(resyncSessionId);
      } catch (error: unknown) {
        toastError(apiErrorText(error, t) ?? t('workoutList.toasts.resyncFailed'));
        throw error;
      }
    }
  };

  const onSubmit = async (dto: UpdateWorkoutListDto): Promise<void> => {
    if (activeSessionId) {
      const result = await confirmDialog({
        title: t('workoutList.resyncDialog.title'),
        description: t('workoutList.resyncDialog.description'),
        confirmationText: t('workoutList.resyncDialog.update'),
        alternateText: t('workoutList.resyncDialog.keep'),
        cancellationText: t('common.cancel'),
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

    toastSuccess(t('workoutList.toasts.updated'));
    navigate({ to: '/' });
  };

  return (
    <EditWorkoutPage
      t={t}
      loadingPhase={loadingPhase}
      workout={workout ?? null}
      submitProgress={progressOf('save')}
      serverFieldErrors={serverFieldErrors}
      onSubmit={(dto: UpdateWorkoutListDto): void => void onSubmit(dto)}
      onCancel={(): void => {
        navigate({ to: '/' });
      }}
    />
  );
};

export default EditWorkoutPageLogicLayer;
