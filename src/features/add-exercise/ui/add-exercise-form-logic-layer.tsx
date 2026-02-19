import { FC, FormEvent, useState } from 'react';
import type { MuscleGroup } from '@entities';
import AddExerciseForm from 'src/features/add-exercise/ui/add-exercise-form';

type Props = {
  onAdd: (name: string, description: string, muscleGroup: MuscleGroup) => void;
};

const AddExerciseFormLogicLayer: FC<Props> = ({ onAdd }) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('chest');

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    onAdd(name, description, muscleGroup);
    
    setName('');
    setDescription('');
    setMuscleGroup('chest');
  };

  const isDisabled: boolean = !name.trim();

  return (
    <AddExerciseForm
      name={name}
      description={description}
      muscleGroup={muscleGroup}
      onNameChange={setName}
      onDescriptionChange={setDescription}
      onMuscleGroupChange={setMuscleGroup}
      onSubmit={handleSubmit}
      isDisabled={isDisabled}
    />
  );
};

export default AddExerciseFormLogicLayer;
