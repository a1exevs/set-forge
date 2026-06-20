import type { Meta } from '@storybook/react';
import { fn } from '@storybook/test';

import { formatDate } from '@shared';
import { mockWorkoutLists } from 'storybook-dir/fixtures/workout-lists';
import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';
import { renderWithPageRouter } from 'storybook-dir/render-with-page-router';

import HomePageLogicLayer from 'src/pages/home/ui/home-page-logic-layer';

const storyTitle = 'Pages/HomePage';

const renderHomePage = (): ReturnType<typeof renderWithPageRouter> =>
  renderWithPageRouter({
    initialEntries: ['/'],
    component: (): JSX.Element => (
      <HomePageLogicLayer
        workoutLists={mockWorkoutLists}
        deleteWorkoutList={async (): Promise<void> => undefined}
        exportAllWorkoutLists={async () => ({
          formatVersion: 1,
          app: 'set-forge',
          exportedAt: new Date().toISOString(),
          workoutLists: [],
        })}
        importWorkoutLists={async (): Promise<void> => undefined}
        onEdit={fn()}
        formatDate={formatDate}
      />
    ),
  });

const meta = {
  title: storyTitle,
  component: HomePageLogicLayer,
} satisfies Meta<typeof HomePageLogicLayer>;

export default meta;

export const Desktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderHomePage });
export const Desktop = buildDesktopStoryObj<typeof meta>({ render: renderHomePage });
export const Tablet = buildTabletStoryObj<typeof meta>({ render: renderHomePage });
export const Mobile = buildMobileStoryObj<typeof meta>({ render: renderHomePage });
