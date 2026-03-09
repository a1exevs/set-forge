import type { Meta } from '@storybook/react';

import { EditWorkoutPage } from '@pages';
import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';

const storyTitle = 'Pages/EditWorkoutPage';

const editWithDataList = {
  id: 'list-1',
  name: 'Push Day',
  description: 'Chest, shoulders, triceps',
  exercises: [
    {
      id: 'ex-1',
      name: 'Bench Press',
      muscleGroup: 'chest' as const,
      weight: 80,
      reps: 10,
      sets: 3,
      completedSets: 0,
    },
    {
      id: 'ex-2',
      name: 'Overhead Press',
      muscleGroup: 'shoulders' as const,
      weight: 50,
      reps: 8,
      sets: 4,
      completedSets: 0,
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  lastUsedAt: null,
};

const meta = {
  title: storyTitle,
  component: EditWorkoutPage,
} satisfies Meta<typeof EditWorkoutPage>;

export default meta;

export const EditWithDataDesktop4k = buildDesktop4KStoryObj<typeof meta>({
  parameters: { router: { initialEntries: ['/edit/list-1'] }, seedEditStorage: [editWithDataList] },
});

export const EditWithDataDesktop = buildDesktopStoryObj<typeof meta>({
  parameters: { router: { initialEntries: ['/edit/list-1'] }, seedEditStorage: [editWithDataList] },
});

export const EditWithDataTablet = buildTabletStoryObj<typeof meta>({
  parameters: { router: { initialEntries: ['/edit/list-1'] }, seedEditStorage: [editWithDataList] },
});

export const EditWithDataMobile = buildMobileStoryObj<typeof meta>({
  parameters: { router: { initialEntries: ['/edit/list-1'] }, seedEditStorage: [editWithDataList] },
});

export const EditNotFoundDesktop4k = buildDesktop4KStoryObj<typeof meta>({
  parameters: { router: { initialEntries: ['/edit/non-existent-id'] } },
});

export const EditNotFoundDesktop = buildDesktopStoryObj<typeof meta>({
  parameters: { router: { initialEntries: ['/edit/non-existent-id'] } },
});

export const EditNotFoundTablet = buildTabletStoryObj<typeof meta>({
  parameters: { router: { initialEntries: ['/edit/non-existent-id'] } },
});

export const EditNotFoundMobile = buildMobileStoryObj<typeof meta>({
  parameters: { router: { initialEntries: ['/edit/non-existent-id'] } },
});
