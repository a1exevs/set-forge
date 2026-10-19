import type { CreateWorkoutListDto } from '@entities/workout-list';

type ExerciseDto = CreateWorkoutListDto['exercises'][number];

// The fields the form shows a server error under, named as in the request: a renamed or removed one fails tsc.
const LIST_FIELDS = ['name', 'description'] as const satisfies readonly (keyof CreateWorkoutListDto)[];
const EXERCISE_FIELDS = [
  'name',
  'muscleGroup',
  'weight',
  'reps',
  'sets',
] as const satisfies readonly (keyof ExerciseDto)[];

type ListField = (typeof LIST_FIELDS)[number];
type ExerciseField = (typeof EXERCISE_FIELDS)[number];

const isListField = (field: string): field is ListField => (LIST_FIELDS as readonly string[]).includes(field);

export const isExerciseField = (field: string): field is ExerciseField =>
  (EXERCISE_FIELDS as readonly string[]).includes(field);

/** The request path of an exercise field: its position in the submitted list and its name (`exercises.0.sets`). */
export const exerciseFieldPath = (index: number, field: ExerciseField): string => `exercises.${index}.${field}`;

/** Whether the form has a field for a request path: a list field, or a field of an exercise at any position. */
export const isFormFieldPath = (path: string): boolean => {
  const parts = path.split('.');
  if (parts.length === 1) {
    return isListField(path);
  }
  const [list = '', position = '', field = ''] = parts;
  return parts.length === 3 && list === 'exercises' && /^\d+$/.test(position) && isExerciseField(field);
};
