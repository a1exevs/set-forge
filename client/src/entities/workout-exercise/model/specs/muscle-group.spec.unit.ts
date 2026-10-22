import { t, tRu } from 'tests/common/translate';

import { muscleGroupLabel, muscleGroups } from '../muscle-group';

describe('muscleGroupLabel', () => {
  // @invariant workout-list/muscle-group-key
  it('labels every stored key in the chosen language, the key itself unchanged', () => {
    expect(muscleGroups.map(group => muscleGroupLabel(group, t))).toEqual([
      'Chest',
      'Back',
      'Legs',
      'Shoulders',
      'Arms',
      'Core',
      'Cardio',
    ]);
    expect(muscleGroups.map(group => muscleGroupLabel(group, tRu))).toEqual([
      'Грудь',
      'Спина',
      'Ноги',
      'Плечи',
      'Руки',
      'Кор',
      'Кардио',
    ]);
    expect(muscleGroups).toEqual(['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio']);
  });
});
