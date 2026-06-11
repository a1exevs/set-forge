import type { Meta } from '@storybook/react';

import { CreateWorkoutPage } from '@pages';
import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';

const storyTitle = 'Pages/CreateWorkoutPage';

const meta = {
  title: storyTitle,
  component: CreateWorkoutPage,
  parameters: { router: { initialEntries: ['/create'] } },
} satisfies Meta<typeof CreateWorkoutPage>;

export default meta;

export const Desktop4k = buildDesktop4KStoryObj<typeof meta>();
export const Desktop = buildDesktopStoryObj<typeof meta>();
export const Tablet = buildTabletStoryObj<typeof meta>();
export const Mobile = buildMobileStoryObj<typeof meta>();
