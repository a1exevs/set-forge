import type { Meta } from '@storybook/react';

import { mockWorkoutList } from 'storybook-dir/fixtures/workout-lists';
import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';
import { renderWithPageRouter } from 'storybook-dir/render-with-page-router';

import EditWorkoutPageLogicLayer from 'src/pages/edit-workout/ui/edit-workout-page-logic-layer';

const storyTitle = 'Pages/EditWorkoutPage';

const editWithDataProps = {
  id: mockWorkoutList.id,
  workout: mockWorkoutList,
  activeSessionId: null,
  updateWorkoutList: async (): Promise<void> => undefined,
  resyncSession: async (): Promise<void> => undefined,
};

const editNotFoundProps = {
  id: 'non-existent-id',
  workout: null,
  activeSessionId: null,
  updateWorkoutList: async (): Promise<void> => undefined,
  resyncSession: async (): Promise<void> => undefined,
};

const renderEditWithData = (): ReturnType<typeof renderWithPageRouter> =>
  renderWithPageRouter({
    initialEntries: [`/edit/${mockWorkoutList.id}`],
    component: (): JSX.Element => <EditWorkoutPageLogicLayer {...editWithDataProps} />,
  });

const renderEditNotFound = (): ReturnType<typeof renderWithPageRouter> =>
  renderWithPageRouter({
    initialEntries: ['/edit/non-existent-id'],
    component: (): JSX.Element => <EditWorkoutPageLogicLayer {...editNotFoundProps} />,
  });

const meta = {
  title: storyTitle,
  component: EditWorkoutPageLogicLayer,
} satisfies Meta<typeof EditWorkoutPageLogicLayer>;

export default meta;

export const EditWithDataDesktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderEditWithData });
export const EditWithDataDesktop = buildDesktopStoryObj<typeof meta>({ render: renderEditWithData });
export const EditWithDataTablet = buildTabletStoryObj<typeof meta>({ render: renderEditWithData });
export const EditWithDataMobile = buildMobileStoryObj<typeof meta>({ render: renderEditWithData });

export const EditNotFoundDesktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderEditNotFound });
export const EditNotFoundDesktop = buildDesktopStoryObj<typeof meta>({ render: renderEditNotFound });
export const EditNotFoundTablet = buildTabletStoryObj<typeof meta>({ render: renderEditNotFound });
export const EditNotFoundMobile = buildMobileStoryObj<typeof meta>({ render: renderEditNotFound });
