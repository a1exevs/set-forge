import type { MuscleGroup } from '@entities';
import { Listbox } from '@headlessui/react';
import { ChangeEvent, FC, FormEvent } from 'react';

import { muscleGroupLabels, muscleGroups } from '@entities';
import { Button, NumericField } from '@shared';

import type { ExerciseFormData } from 'src/widgets/workout-list-form/model';
import classes from 'src/widgets/workout-list-form/ui/workout-list-form.module.scss';

type Props = {
  title: string;
  submitButtonText: string;
  name: string;
  description: string;
  exercises: ExerciseFormData[];
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAddExercise: () => void;
  onRemoveExercise: (tempId: string) => void;
  onUpdateExercise: (
    tempId: string,
    field: keyof ExerciseFormData,
    value: ExerciseFormData[keyof ExerciseFormData],
  ) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  submitAttempted: boolean;
  getExerciseNumericFieldError: (
    exercise: Pick<ExerciseFormData, 'weight' | 'reps' | 'sets'>,
    field: 'weight' | 'reps' | 'sets',
  ) => string | undefined;
};

const WorkoutListForm: FC<Props> = ({
  title,
  submitButtonText,
  name,
  description,
  exercises,
  onNameChange,
  onDescriptionChange,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
  onSubmit,
  onCancel,
  submitAttempted,
  getExerciseNumericFieldError,
}) => {
  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <h1>{title}</h1>
      </header>

      <main className={classes.main}>
        <form className={classes.form} onSubmit={onSubmit}>
          <div className={classes.section}>
            <div>
              <label htmlFor="name" className={classes.label}>
                List Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => onNameChange(e.target.value)}
                className={classes.input}
                placeholder="e.g., Push Day"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className={classes.label}>
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>): void => onDescriptionChange(e.target.value)}
                className={classes.textarea}
                placeholder="Chest, shoulders, triceps"
                rows={2}
              />
            </div>
          </div>

          <div className={`${classes.section} ${classes.section_withoutGap}`}>
            <div className={classes.sectionHeader}>
              <h2>Exercises</h2>
              <Button type="button" onClick={onAddExercise} size="sm">
                + Add Exercise
              </Button>
            </div>

            {exercises.length === 0 ? (
              <p className={classes.emptyExercises}>Add exercises to your list</p>
            ) : (
              <div className={classes.exerciseList}>
                {exercises.map((exercise, index) => (
                  <div key={exercise.tempId} className={classes.exerciseCard}>
                    <div className={classes.exerciseHeader}>
                      <span className={classes.exerciseNumber}>{index + 1}</span>
                      <button
                        type="button"
                        className={classes.removeButton}
                        onClick={(): void => onRemoveExercise(exercise.tempId)}
                        aria-label="Remove exercise"
                      >
                        ✕
                      </button>
                    </div>

                    <div>
                      <label className={classes.label}>Name *</label>
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                          onUpdateExercise(exercise.tempId, 'name', e.target.value)
                        }
                        className={classes.input}
                        placeholder="Bench Press"
                        required
                      />
                    </div>

                    <div>
                      <label className={classes.label}>Muscle Group</label>
                      <Listbox
                        value={exercise.muscleGroup}
                        onChange={(value: MuscleGroup): void => onUpdateExercise(exercise.tempId, 'muscleGroup', value)}
                      >
                        <div className={classes.listboxWrapper}>
                          <Listbox.Button className={classes.listboxButton}>
                            {muscleGroupLabels[exercise.muscleGroup]}
                          </Listbox.Button>
                          <Listbox.Options className={classes.listboxOptions}>
                            {muscleGroups.map((group: MuscleGroup) => (
                              <Listbox.Option key={group} value={group} className={classes.listboxOption}>
                                {({ active, selected }) => (
                                  <span
                                    className={`${classes.optionText} ${
                                      active ? classes.active : ''
                                    } ${selected ? classes.selected : ''}`}
                                  >
                                    {muscleGroupLabels[group]}
                                  </span>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </div>
                      </Listbox>
                    </div>

                    <div className={classes.fieldRow}>
                      <NumericField
                        label="Weight (kg)"
                        id={`weight-${exercise.tempId}`}
                        value={exercise.weight}
                        onChange={(v: number | null): void => onUpdateExercise(exercise.tempId, 'weight', v)}
                        variant="decimal"
                        size="sm"
                        error={submitAttempted ? getExerciseNumericFieldError(exercise, 'weight') : undefined}
                      />
                      <NumericField
                        label="Reps"
                        id={`reps-${exercise.tempId}`}
                        value={exercise.reps}
                        onChange={(v: number | null): void => onUpdateExercise(exercise.tempId, 'reps', v)}
                        variant="integer"
                        size="sm"
                        error={submitAttempted ? getExerciseNumericFieldError(exercise, 'reps') : undefined}
                      />
                      <NumericField
                        label="Sets"
                        id={`sets-${exercise.tempId}`}
                        value={exercise.sets}
                        onChange={(v: number | null): void => onUpdateExercise(exercise.tempId, 'sets', v)}
                        variant="integer"
                        size="sm"
                        error={submitAttempted ? getExerciseNumericFieldError(exercise, 'sets') : undefined}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={classes.actions}>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{submitButtonText}</Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default WorkoutListForm;
