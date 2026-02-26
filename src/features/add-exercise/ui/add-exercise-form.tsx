import type { MuscleGroup } from '@entities';
import { ChangeEvent, FC, FormEvent } from 'react';

import { Button } from '@shared';

import classes from 'src/features/add-exercise/ui/add-exercise-form.module.scss';

type Props = {
  name: string;
  description: string;
  muscleGroup: MuscleGroup;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onMuscleGroupChange: (value: MuscleGroup) => void;
  onSubmit: (e: FormEvent) => void;
  isDisabled: boolean;
};

const muscleGroups: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'];

const AddExerciseForm: FC<Props> = ({
  name,
  description,
  muscleGroup,
  onNameChange,
  onDescriptionChange,
  onMuscleGroupChange,
  onSubmit,
  isDisabled,
}) => {
  return (
    <form className={classes.form} onSubmit={onSubmit}>
      <div className={classes.field}>
        <label htmlFor="name" className={classes.label}>
          Exercise Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>): void => onNameChange(e.target.value)}
          className={classes.input}
          placeholder="Enter exercise name"
          required
        />
      </div>

      <div className={classes.field}>
        <label htmlFor="description" className={classes.label}>
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>): void => onDescriptionChange(e.target.value)}
          className={classes.textarea}
          placeholder="Enter description"
          rows={3}
        />
      </div>

      <div className={classes.field}>
        <label htmlFor="muscleGroup" className={classes.label}>
          Muscle Group
        </label>
        <select
          id="muscleGroup"
          value={muscleGroup}
          onChange={(e: ChangeEvent<HTMLSelectElement>): void => onMuscleGroupChange(e.target.value as MuscleGroup)}
          className={classes.select}
          required
        >
          {muscleGroups.map((group: MuscleGroup) => (
            <option key={group} value={group}>
              {group.charAt(0).toUpperCase() + group.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" disabled={isDisabled}>
        Add Exercise
      </Button>
    </form>
  );
};

export default AddExerciseForm;
