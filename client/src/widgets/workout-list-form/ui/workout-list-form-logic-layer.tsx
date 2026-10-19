import { FC, FormEvent, useEffect, useState } from 'react';

import type { MuscleGroup } from '@entities/workout-exercise';
import type { CreateWorkoutListDto, UpdateWorkoutListDto, WorkoutList } from '@entities/workout-list';
import { type Progress, useConfirm } from '@shared/lib';

import WorkoutListForm from './workout-list-form';
import type { ExerciseFormData } from '../model/exercise-form-data';
import {
  getExerciseNumericFieldError,
  hasInvalidExerciseName,
  hasInvalidExerciseNumericFields,
  toExerciseSubmitPayload,
} from '../model/exercise-numeric-validation';
import { exerciseFieldPath, isExerciseField } from '../model/form-fields';

type BaseProps = {
  onCancel: () => void;
  /** The save in flight, run by the caller: the form locks its fields meanwhile. */
  submitProgress?: Progress;
  /** The server's errors of the last save by request path (`formServerErrors`), each shown under its field. */
  serverFieldErrors?: Record<string, string>;
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
  const { mode, onCancel, submitProgress = 'idle', serverFieldErrors } = props;
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

  const [serverErrors, setServerErrors] = useState<Record<string, string>>(() => serverFieldErrors ?? {});

  useEffect((): void => {
    setServerErrors(serverFieldErrors ?? {});
  }, [serverFieldErrors]);

  // An edited field drops its server error; adding or removing an exercise shifts the positions the errors point to.
  const dropServerErrors = (matches: (field: string) => boolean): void => {
    setServerErrors(prev =>
      Object.keys(prev).some(matches)
        ? Object.fromEntries(Object.entries(prev).filter(([field]: [string, string]) => !matches(field)))
        : prev,
    );
  };

  const changeName = (value: string): void => {
    setName(value);
    dropServerErrors(field => field === 'name');
  };

  const changeDescription = (value: string): void => {
    setDescription(value);
    dropServerErrors(field => field === 'description');
  };

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
    dropServerErrors(field => field.startsWith('exercises.'));
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
    dropServerErrors(field => field.startsWith('exercises.'));
    setExercises(prev => prev.filter(ex => ex.tempId !== tempId));
  };

  const updateExercise = (
    tempId: string,
    field: keyof ExerciseFormData,
    value: ExerciseFormData[keyof ExerciseFormData],
  ): void => {
    const index = exercises.findIndex(ex => ex.tempId === tempId);
    if (isExerciseField(field)) {
      dropServerErrors(path => path === exerciseFieldPath(index, field));
    }
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

  return (
    <WorkoutListForm
      notFound={mode === 'edit' && !initialData}
      title={title}
      submitButtonText={submitButtonText}
      submitProgress={submitProgress}
      name={name}
      description={description}
      exercises={exercises}
      onNameChange={changeName}
      onDescriptionChange={changeDescription}
      onAddExercise={addExercise}
      onRemoveExercise={removeExercise}
      onUpdateExercise={updateExercise}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitAttempted={submitAttempted}
      getExerciseNumericFieldError={getExerciseNumericFieldError}
      getServerFieldError={(path: string): string | undefined => serverErrors[path]}
    />
  );
};

export default WorkoutListFormLogicLayer;
