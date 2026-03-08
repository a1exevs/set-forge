import type { CreateWorkoutListDto, MuscleGroup } from '@entities';
import { useNavigate } from '@tanstack/react-router';
import { FC, FormEvent, useState } from 'react';

import { useConfirm } from '@shared';

import CreateWorkoutPage from 'src/pages/create-workout/ui/create-workout-page';

export type ExerciseFormData = {
  tempId: string;
  name: string;
  muscleGroup: MuscleGroup;
  weight: number;
  reps: number;
  sets: number;
};

type Props = {
  onAddWorkoutList: (dto: CreateWorkoutListDto) => void;
};

const CreateWorkoutPageLogicLayer: FC<Props> = ({ onAddWorkoutList }) => {
  const confirmDialog = useConfirm();
  const navigate = useNavigate();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [exercises, setExercises] = useState<ExerciseFormData[]>([]);

  const addExercise = (): void => {
    setExercises([
      ...exercises,
      {
        tempId: crypto.randomUUID(),
        name: '',
        muscleGroup: 'chest',
        weight: 0,
        reps: 10,
        sets: 3,
      },
    ]);
  };

  const removeExercise = (tempId: string): void => {
    setExercises(exercises.filter(ex => ex.tempId !== tempId));
  };

  const updateExercise = (
    tempId: string,
    field: keyof ExerciseFormData,
    value: ExerciseFormData[keyof ExerciseFormData],
  ): void => {
    setExercises(exercises.map(ex => (ex.tempId === tempId ? { ...ex, [field]: value } : ex)));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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

    const invalidExercise = exercises.find(ex => !ex.name.trim() || ex.weight < 0 || ex.reps <= 0 || ex.sets <= 0);

    if (invalidExercise) {
      await confirmDialog({
        title: 'Please check exercise data validity',
        hideCancelButton: true,
        confirmationText: 'Ok',
      });
      return;
    }

    const dto: CreateWorkoutListDto = {
      name: name.trim(),
      description: description.trim(),
      exercises: exercises.map(({ tempId: _, ...ex }) => ex),
    };

    onAddWorkoutList(dto);
    navigate({ to: '/' });
  };

  const handleCancel = (): void => {
    navigate({ to: '/' });
  };

  return (
    <CreateWorkoutPage
      name={name}
      description={description}
      exercises={exercises}
      onNameChange={setName}
      onDescriptionChange={setDescription}
      onAddExercise={addExercise}
      onRemoveExercise={removeExercise}
      onUpdateExercise={updateExercise}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default CreateWorkoutPageLogicLayer;
