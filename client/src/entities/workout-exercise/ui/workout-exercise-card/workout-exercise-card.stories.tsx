import type { Meta } from '@storybook/react';

import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';

import WorkoutExerciseCard from 'src/entities/workout-exercise/ui/workout-exercise-card/workout-exercise-card';

const storyTitle = 'Entities/WorkoutExerciseCard';

const meta = {
  title: storyTitle,
  component: WorkoutExerciseCard,
  args: {
    exercise: {
      id: 'ex-1',
      name: 'Bench Press',
      muscleGroup: 'chest',
      weight: 60,
      reps: 10,
      sets: 3,
    },
  },
} satisfies Meta<typeof WorkoutExerciseCard>;

export default meta;

export const DefaultDesktop4k = buildDesktop4KStoryObj<typeof meta>();
export const DefaultDesktop = buildDesktopStoryObj<typeof meta>();
export const DefaultTablet = buildTabletStoryObj<typeof meta>();
export const DefaultMobile = buildMobileStoryObj<typeof meta>();
