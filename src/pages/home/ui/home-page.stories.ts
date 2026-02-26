import type { Meta } from '@storybook/react';

import { HomePage } from '@pages';
import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';

const storyTitle = 'Pages/HomePage';

const meta = {
  title: storyTitle,
  component: HomePage,
  parameters: { router: { initialEntries: ['/'] } },
} satisfies Meta<typeof HomePage>;

export default meta;

export const Desktop4k = buildDesktop4KStoryObj<typeof meta>();
export const Desktop = buildDesktopStoryObj<typeof meta>();
export const Tablet = buildTabletStoryObj<typeof meta>();
export const Mobile = buildMobileStoryObj<typeof meta>();
