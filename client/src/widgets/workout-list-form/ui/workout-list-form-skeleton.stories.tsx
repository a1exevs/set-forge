import type { Meta } from '@storybook/react';

import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';

import WorkoutListFormSkeleton from './workout-list-form-skeleton';

const meta = {
  title: 'Widgets/WorkoutListFormSkeleton',
  component: WorkoutListFormSkeleton,
  parameters: {
    docs: {
      description: {
        component:
          'What the edit screen shows while the list it edits loads: the form as bones — title, name and ' +
          'description, three exercise cards, the actions — in the sections and geometry of the real form, so the ' +
          'form takes their place without the page jumping.',
      },
    },
  },
} satisfies Meta<typeof WorkoutListFormSkeleton>;

export default meta;

/** The loading form at 4K. */
export const Desktop4k = buildDesktop4KStoryObj<typeof meta>({});
/** The loading form on a desktop screen. */
export const Desktop = buildDesktopStoryObj<typeof meta>({});
/** The loading form on a tablet. */
export const Tablet = buildTabletStoryObj<typeof meta>({});
/** The loading form on a phone: the everyday form of the page. */
export const Mobile = buildMobileStoryObj<typeof meta>({});
