import type { Meta } from '@storybook/react';

import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';
import { withFrame } from 'storybook-dir/showcase';

import HistoryPageSkeleton from './history-page-skeleton';

const meta = {
  title: 'Pages/HistoryPageSkeleton',
  component: HistoryPageSkeleton,
  args: { label: 'Loading history' },
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'What the history page shows in place of its session rows while they load: rows of the same card ' +
          'geometry, so the sessions take their place without the page jumping. Ten fill the first screen while ' +
          'the first page loads; two close the list while the next page loads.',
      },
    },
  },
} satisfies Meta<typeof HistoryPageSkeleton>;

export default meta;

/** The rows at 4K. */
export const Desktop4k = buildDesktop4KStoryObj<typeof meta>({});
/** The rows on a desktop screen. */
export const Desktop = buildDesktopStoryObj<typeof meta>({});
/** The rows on a tablet. */
export const Tablet = buildTabletStoryObj<typeof meta>({});
/** The rows on a phone: the everyday form of the page. */
export const Mobile = buildMobileStoryObj<typeof meta>({});
/** Two rows at the end of the list while the next page loads. */
export const NextPageMobile = buildMobileStoryObj<typeof meta>({ args: { rows: 2, label: 'Loading more history' } });
