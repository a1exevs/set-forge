import type { Meta } from '@storybook/react';

import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';
import { renderWithPageRouter } from 'storybook-dir/render-with-page-router';

import WorkoutModePageSkeleton from './workout-mode-page-skeleton';

const renderSkeleton = (): ReturnType<typeof renderWithPageRouter> =>
  renderWithPageRouter({
    initialEntries: ['/'],
    component: (): JSX.Element => <WorkoutModePageSkeleton />,
  });

const meta = {
  title: 'Pages/WorkoutModePageSkeleton',
  component: WorkoutModePageSkeleton,
  parameters: {
    docs: {
      description: {
        component:
          'What the workout screen shows while the list and the active session load: the real way back, a title ' +
          'and the progress bar as bones in the header, three exercise cards below. The phase (preview or training) ' +
          'is unknown until the data arrives, so neither Start nor Finish is part of the skeleton.',
      },
    },
  },
} satisfies Meta<typeof WorkoutModePageSkeleton>;

export default meta;

/** The loading screen at 4K. */
export const Desktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderSkeleton });
/** The loading screen on a desktop screen. */
export const Desktop = buildDesktopStoryObj<typeof meta>({ render: renderSkeleton });
/** The loading screen on a tablet. */
export const Tablet = buildTabletStoryObj<typeof meta>({ render: renderSkeleton });
/** The loading screen on a phone: the everyday form of the page. */
export const Mobile = buildMobileStoryObj<typeof meta>({ render: renderSkeleton });
