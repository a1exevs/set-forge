import type { Meta } from '@storybook/react';
import { fn } from '@storybook/test';

import { mockWorkoutLists } from 'storybook-dir/fixtures/workout-lists';
import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';
import { renderWithPageRouter } from 'storybook-dir/render-with-page-router';

import type { WorkoutListsExportFile } from '@entities/workout-list';
import { formatDate } from '@shared/lib';

import HomePageLogicLayer from './home-page-logic-layer';

const renderHomePage = (): ReturnType<typeof renderWithPageRouter> =>
  renderWithPageRouter({
    initialEntries: ['/'],
    component: (): JSX.Element => (
      <HomePageLogicLayer
        workoutLists={mockWorkoutLists}
        isLoading={false}
        deleteWorkoutList={async (): Promise<void> => undefined}
        clearWorkoutSessionCachesForDeletedList={(): void => undefined}
        exportAllWorkoutLists={async (): Promise<WorkoutListsExportFile> => ({
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
  title: 'Pages/HomePage',
  component: HomePageLogicLayer,
} satisfies Meta<typeof HomePageLogicLayer>;

export default meta;

export const Desktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderHomePage });
export const Desktop = buildDesktopStoryObj<typeof meta>({ render: renderHomePage });
export const Tablet = buildTabletStoryObj<typeof meta>({ render: renderHomePage });
export const Mobile = buildMobileStoryObj<typeof meta>({ render: renderHomePage });

const renderHomePageLoading = (): ReturnType<typeof renderWithPageRouter> =>
  renderWithPageRouter({
    initialEntries: ['/'],
    component: (): JSX.Element => (
      <HomePageLogicLayer
        workoutLists={[]}
        isLoading
        deleteWorkoutList={async (): Promise<void> => undefined}
        clearWorkoutSessionCachesForDeletedList={(): void => undefined}
        exportAllWorkoutLists={async (): Promise<WorkoutListsExportFile> => ({
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

/** The lists are still loading: the header is real, the cards are a skeleton. */
export const LoadingMobile = buildMobileStoryObj<typeof meta>({ render: renderHomePageLoading });
