import type { Meta } from '@storybook/react';

import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';
import { withFrame } from 'storybook-dir/showcase';

import HomePageSkeleton from './home-page-skeleton';

const meta = {
  title: 'Pages/HomePageSkeleton',
  component: HomePageSkeleton,
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'What the home page shows in place of its workout list cards while the lists load: three cards of the ' +
          'same grid and geometry, so the content takes their place without the page jumping.',
      },
    },
  },
} satisfies Meta<typeof HomePageSkeleton>;

export default meta;

/** Three columns at 4K, as the real grid lays the cards out. */
export const Desktop4k = buildDesktop4KStoryObj<typeof meta>({});
/** Three columns on a desktop screen. */
export const Desktop = buildDesktopStoryObj<typeof meta>({});
/** Two columns on a tablet. */
export const Tablet = buildTabletStoryObj<typeof meta>({});
/** One column on a phone: the everyday form of the page. */
export const Mobile = buildMobileStoryObj<typeof meta>({});
