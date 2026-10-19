import { exerciseFieldPath, isFormFieldPath } from '../form-fields';

describe('form fields', () => {
  it('builds the request path of an exercise field', () => {
    expect(exerciseFieldPath(2, 'sets')).toBe('exercises.2.sets');
  });

  it.each(['name', 'description', 'exercises.0.name', 'exercises.12.muscleGroup', exerciseFieldPath(1, 'weight')])(
    'knows %s as a field of the form',
    (path: string) => {
      expect(isFormFieldPath(path)).toBe(true);
    },
  );

  it.each([
    'id',
    'exercises',
    'exercises.0',
    'exercises.0.id',
    'exercises.x.name',
    'exercises.0.name.first',
    'items.0.name',
  ])('has no field for %s', (path: string) => {
    expect(isFormFieldPath(path)).toBe(false);
  });
});
