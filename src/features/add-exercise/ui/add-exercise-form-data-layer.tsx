import { FC } from 'react';
import { useExerciseStore, type MuscleGroup } from '@entities';
import AddExerciseFormLogicLayer from 'src/features/add-exercise/ui/add-exercise-form-logic-layer';

const AddExerciseFormDataLayer: FC = () => {
  const addExercise = useExerciseStore.use.addExercise();

  const handleAdd = (name: string, description: string, muscleGroup: MuscleGroup): void => {
    addExercise({ name, description, muscleGroup });
  };

  return <AddExerciseFormLogicLayer onAdd={handleAdd} />;
};

export default AddExerciseFormDataLayer;
