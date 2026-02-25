import type { MuscleGroup } from '@entities';
import { Listbox } from '@headlessui/react';
import { ChangeEvent, FC, FormEvent } from 'react';

import { muscleGroupLabels, muscleGroups } from '@entities';
import { Button } from '@shared';

import type { ExerciseFormData } from 'src/pages/create-workout/ui/create-workout-page-logic-layer';
import classes from 'src/pages/create-workout/ui/create-workout-page.module.scss';

type Props = {
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
};

const CreateWorkoutPage: FC<Props> = ({
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
}) => {
  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <h1>New Workout List</h1>
      </header>

      <main className={classes.main}>
        <form className={classes.form} onSubmit={onSubmit}>
          <div className={classes.section}>
            <div className={classes.field}>
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

            <div className={classes.field}>
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

          <div className={classes.section}>
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

                    <div className={classes.field}>
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

                    <div className={classes.field}>
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
                      <div className={classes.field}>
                        <label className={classes.label}>Weight (kg)</label>
                        <input
                          type="number"
                          value={exercise.weight}
                          onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                            onUpdateExercise(exercise.tempId, 'weight', Number(e.target.value))
                          }
                          className={classes.inputSmall}
                          min="0"
                          step="0.5"
                        />
                      </div>

                      <div className={classes.field}>
                        <label className={classes.label}>Reps</label>
                        <input
                          type="number"
                          value={exercise.reps}
                          onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                            onUpdateExercise(exercise.tempId, 'reps', Number(e.target.value))
                          }
                          className={classes.inputSmall}
                          min="1"
                        />
                      </div>

                      <div className={classes.field}>
                        <label className={classes.label}>Sets</label>
                        <input
                          type="number"
                          value={exercise.sets}
                          onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                            onUpdateExercise(exercise.tempId, 'sets', Number(e.target.value))
                          }
                          className={classes.inputSmall}
                          min="1"
                        />
                      </div>
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
            <Button type="submit">Create List</Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateWorkoutPage;
