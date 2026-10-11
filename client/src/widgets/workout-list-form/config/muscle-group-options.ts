import { type MuscleGroup, muscleGroupLabels, muscleGroups } from '@entities/workout-exercise';
import type { SelectOption } from '@shared/ui';

export const muscleGroupOptions: SelectOption[] = muscleGroups.map((group: MuscleGroup) => ({
  value: group,
  label: muscleGroupLabels[group],
}));
