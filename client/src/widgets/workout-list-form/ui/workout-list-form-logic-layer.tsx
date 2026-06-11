import type { CreateWorkoutListDto, MuscleGroup, UpdateWorkoutListDto, WorkoutList } from '@entities';
import { FC, FormEvent, useEffect, useState } from 'react';

import { useConfirm } from '@shared';
import { NotFoundMessage } from '@widgets';

import {
  type ExerciseFormData,
  getExerciseNumericFieldError,
  hasInvalidExerciseName,
  hasInvalidExerciseNumericFields,
  toExerciseSubmitPayload,
} from 'src/widgets/workout-list-form/model';
import WorkoutListForm from 'src/widgets/workout-list-form/ui/workout-list-form';
import classes from 'src/widgets/workout-list-form/ui/workout-list-form.module.scss';

type BaseProps = {
  onCancel: () => void;
};

type CreateProps = BaseProps & {
  mode: 'create';
  onSubmit: (dto: CreateWorkoutListDto) => void;
};

type EditProps = BaseProps & {
  mode: 'edit';
  initialData?: WorkoutList;
  onSubmit: (dto: UpdateWorkoutListDto) => void;
};

type Props = CreateProps | EditProps;

const WorkoutListFormLogicLayer: FC<Props> = props => {
  const { mode, onCancel } = props;
  const initialData = props.mode === 'edit' ? props.initialData : undefined;
  const confirmDialog = useConfirm();

  const [name, setName] = useState<string>(() => initialData?.name ?? '');
  const [description, setDescription] = useState<string>(() => initialData?.description ?? '');
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);
  const [exercises, setExercises] = useState<ExerciseFormData[]>(() =>
    (initialData?.exercises ?? []).map(ex => ({
      tempId: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      weight: ex.weight,
      reps: ex.reps,
      sets: ex.sets,
    })),
  );

  useEffect((): void => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setExercises(
        initialData.exercises.map(ex => ({
          tempId: ex.id,
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          weight: ex.weight,
          reps: ex.reps,
          sets: ex.sets,
        })),
      );
    }
  }, [mode, initialData]);

  const addExercise = (): void => {
    setExercises(prev => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        name: '',
        muscleGroup: 'chest' as MuscleGroup,
        weight: 0,
        reps: 10,
        sets: 3,
      },
    ]);
  };

  const removeExercise = (tempId: string): void => {
    setExercises(prev => prev.filter(ex => ex.tempId !== tempId));
  };

  const updateExercise = (
    tempId: string,
    field: keyof ExerciseFormData,
    value: ExerciseFormData[keyof ExerciseFormData],
  ): void => {
    setExercises(prev => prev.map(ex => (ex.tempId === tempId ? { ...ex, [field]: value } : ex)));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    try {
      e.preventDefault();

      if (!name.trim()) {
        await confirmDialog({
          title: 'Please enter a list name',
          hideCancelButton: true,
          confirmationText: 'Ok',
        });
        return;
      }

      if (exercises.length === 0) {
        await confirmDialog({
          title: 'Please add at least one exercise',
          hideCancelButton: true,
          confirmationText: 'Ok',
        });
        return;
      }

      const nameInvalid = exercises.some(hasInvalidExerciseName);
      const numericInvalid = exercises.some(hasInvalidExerciseNumericFields);

      if (nameInvalid || numericInvalid) {
        setSubmitAttempted(true);
      }

      if (nameInvalid) {
        await confirmDialog({
          title: 'Please check exercise data validity',
          hideCancelButton: true,
          confirmationText: 'Ok',
        });
        return;
      }

      if (numericInvalid) {
        return;
      }

      setSubmitAttempted(false);

      if (mode === 'create') {
        const dto: CreateWorkoutListDto = {
          name: name.trim(),
          description: description.trim(),
          exercises: exercises.map(ex => toExerciseSubmitPayload(ex)),
        };
        props.onSubmit(dto);
      } else if (initialData) {
        const dto: UpdateWorkoutListDto = {
          name: name.trim(),
          description: description.trim(),
          exercises: exercises.map(ex => {
            const orig = initialData.exercises.find(orig => orig.id === ex.tempId);
            if (orig) {
              return {
                id: orig.id,
                completedSets: orig.completedSets,
                ...toExerciseSubmitPayload(ex),
              };
            }
            return toExerciseSubmitPayload(ex);
          }),
        };
        props.onSubmit(dto);
      }
    } catch (e: unknown) {
      await confirmDialog({
        title: `${e instanceof Error ? e.message : `An error occurred while ${mode === 'create' ? 'creating' : 'editing'} the workout list`}`,
        hideCancelButton: true,
        confirmationText: 'Ok',
      });
    }
  };

  const title = mode === 'create' ? 'New Workout List' : `Editing ${name || initialData?.name || 'Untitled'}`;
  const submitButtonText = mode === 'create' ? 'Create List' : 'Save';

  if (mode === 'edit' && !initialData) {
    return (
      <div className={classes.container}>
        <NotFoundMessage title="Workout list not found" backToLink="/" />
      </div>
    );
  }

  return (
    <WorkoutListForm
      title={title}
      submitButtonText={submitButtonText}
      name={name}
      description={description}
      exercises={exercises}
      onNameChange={setName}
      onDescriptionChange={setDescription}
      onAddExercise={addExercise}
      onRemoveExercise={removeExercise}
      onUpdateExercise={updateExercise}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitAttempted={submitAttempted}
      getExerciseNumericFieldError={getExerciseNumericFieldError}
    />
  );
};

export default WorkoutListFormLogicLayer;
