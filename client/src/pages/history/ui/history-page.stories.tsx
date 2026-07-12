import type { Meta } from '@storybook/react';
import { fn } from '@storybook/test';

import { mockWorkoutSessions } from 'storybook-dir/fixtures/workout-sessions';
import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';
import { renderWithPageRouter } from 'storybook-dir/render-with-page-router';

import HistoryPageLogicLayer from 'src/pages/history/ui/history-page-logic-layer';

const storyTitle = 'Pages/HistoryPage';

const renderHistoryPage = (): ReturnType<typeof renderWithPageRouter> =>
  renderWithPageRouter({
    initialEntries: ['/history'],
    component: (): JSX.Element => (
      <HistoryPageLogicLayer
        sessions={mockWorkoutSessions}
        total={mockWorkoutSessions.length}
        isLoading={false}
        isError={false}
        isFetchingNextPage={false}
        hasMore={false}
        fetchNextPage={fn()}
      />
    ),
  });

const meta = {
  title: storyTitle,
  component: HistoryPageLogicLayer,
} satisfies Meta<typeof HistoryPageLogicLayer>;

export default meta;

export const Desktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderHistoryPage });
export const Desktop = buildDesktopStoryObj<typeof meta>({ render: renderHistoryPage });
export const Tablet = buildTabletStoryObj<typeof meta>({ render: renderHistoryPage });
export const Mobile = buildMobileStoryObj<typeof meta>({ render: renderHistoryPage });
