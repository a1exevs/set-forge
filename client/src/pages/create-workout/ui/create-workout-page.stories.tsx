import type { Meta } from '@storybook/react';

import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';
import { renderWithPageRouter } from 'storybook-dir/render-with-page-router';

import CreateWorkoutPageLogicLayer from 'src/pages/create-workout/ui/create-workout-page-logic-layer';

const storyTitle = 'Pages/CreateWorkoutPage';

const renderCreateWorkoutPage = (): ReturnType<typeof renderWithPageRouter> =>
  renderWithPageRouter({
    initialEntries: ['/create'],
    component: (): JSX.Element => <CreateWorkoutPageLogicLayer onCreate={async (): Promise<void> => undefined} />,
  });

const meta = {
  title: storyTitle,
  component: CreateWorkoutPageLogicLayer,
} satisfies Meta<typeof CreateWorkoutPageLogicLayer>;

export default meta;

export const Desktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderCreateWorkoutPage });
export const Desktop = buildDesktopStoryObj<typeof meta>({ render: renderCreateWorkoutPage });
export const Tablet = buildTabletStoryObj<typeof meta>({ render: renderCreateWorkoutPage });
export const Mobile = buildMobileStoryObj<typeof meta>({ render: renderCreateWorkoutPage });
