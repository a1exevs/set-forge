import { FC } from 'react';

import type { UpdateWorkoutListDto, WorkoutList } from '@entities/workout-list';
import type { LoadingPhase, Progress } from '@shared/lib';
import { NotFoundMessage } from '@shared/ui';
import { WorkoutListForm, WorkoutListFormSkeleton } from '@widgets/workout-list-form';

type Props = {
  loadingPhase: LoadingPhase;
  workout: WorkoutList | null;
  submitProgress: Progress;
  /** The server's field errors of the last save, shown under the fields of the form. */
  serverFieldErrors?: Record<string, string>;
  onSubmit: (dto: UpdateWorkoutListDto) => void;
  onCancel: () => void;
};

const EditWorkoutPage: FC<Props> = ({
  loadingPhase,
  workout,
  submitProgress,
  serverFieldErrors,
  onSubmit,
  onCancel,
}) => {
  if (loadingPhase === 'skeleton') {
    return <WorkoutListFormSkeleton />;
  }
  // Before the skeleton is due: a list that comes sooner shows with no skeleton
  if (loadingPhase === 'blank') {
    return null;
  }

  // TODO: Distinguish query errors from a missing list — not only "Workout list not found" (see data layer)
  if (workout === null) {
    return <NotFoundMessage title="Workout list not found" backToLabel="Back to Home" />;
  }

  return (
    <WorkoutListForm
      mode="edit"
      initialData={workout}
      submitProgress={submitProgress}
      serverFieldErrors={serverFieldErrors}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
};

export default EditWorkoutPage;
