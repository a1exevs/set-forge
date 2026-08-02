import type { Meta } from '@storybook/react';

import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';

import type { WorkoutSessionExercise } from 'src/entities/workout-session-exercise/model/types';
import WorkoutSessionExerciseCard from 'src/entities/workout-session-exercise/ui/workout-session-exercise-card/workout-session-exercise-card-logic-layer';

const storyTitle = 'Entities/WorkoutSessionExerciseCard';

const IN_PROGRESS_EXERCISE: WorkoutSessionExercise = {
  id: 'sx-1',
  sourceExerciseId: 'ex-1',
  name: 'Bench Press',
  muscleGroup: 'chest',
  weight: 60,
  reps: 10,
  sets: 3,
  completedSets: 1,
};

const COMPLETED_EXERCISE: WorkoutSessionExercise = {
  ...IN_PROGRESS_EXERCISE,
  completedSets: 3,
};

const meta = {
  title: storyTitle,
  component: WorkoutSessionExerciseCard,
  args: {
    exercise: IN_PROGRESS_EXERCISE,
    justCompleted: false,
    isFinished: false,
    onTap: (): void => undefined,
  },
} satisfies Meta<typeof WorkoutSessionExerciseCard>;

export default meta;

export const InProgressDesktop4k = buildDesktop4KStoryObj<typeof meta>();
export const InProgressDesktop = buildDesktopStoryObj<typeof meta>();
export const InProgressTablet = buildTabletStoryObj<typeof meta>();
export const InProgressMobile = buildMobileStoryObj<typeof meta>();

export const CompletedDesktop4k = buildDesktop4KStoryObj<typeof meta>({
  args: { exercise: COMPLETED_EXERCISE },
});

export const CompletedDesktop = buildDesktopStoryObj<typeof meta>({
  args: { exercise: COMPLETED_EXERCISE },
});

export const CompletedTablet = buildTabletStoryObj<typeof meta>({
  args: { exercise: COMPLETED_EXERCISE },
});

export const CompletedMobile = buildMobileStoryObj<typeof meta>({
  args: { exercise: COMPLETED_EXERCISE },
});
