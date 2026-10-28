import type { Meta } from '@storybook/react';
import { fn } from '@storybook/test';
import { createRef } from 'react';

import { mockWorkoutSessions } from 'storybook-dir/fixtures/workout-sessions';
import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';
import { renderWithPageRouter } from 'storybook-dir/render-with-page-router';

import { type MuscleGroup, muscleGroupLabel } from '@entities/workout-exercise';
import type { WorkoutSession } from '@entities/workout-session';
import { useT } from '@shared/lib';

import HistoryPage from './history-page';
import HistoryPageLogicLayer from './history-page-logic-layer';
import { formatSessionDate, formatSummary } from '../lib/history-formatters';

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
  title: 'Pages/HistoryPage',
  component: HistoryPageLogicLayer,
} satisfies Meta<typeof HistoryPageLogicLayer>;

export default meta;

export const Desktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderHistoryPage });
export const Desktop = buildDesktopStoryObj<typeof meta>({ render: renderHistoryPage });
export const Tablet = buildTabletStoryObj<typeof meta>({ render: renderHistoryPage });
export const Mobile = buildMobileStoryObj<typeof meta>({ render: renderHistoryPage });

type LoadingStateProps = {
  sessions: typeof mockWorkoutSessions;
  loadingPhase: 'skeleton' | 'content';
  showNextPageSkeleton: boolean;
};

const renderHistoryPageIn =
  ({ sessions, loadingPhase, showNextPageSkeleton }: LoadingStateProps) =>
  (): ReturnType<typeof renderWithPageRouter> =>
    renderWithPageRouter({
      initialEntries: ['/history'],
      component: function HistoryPageStory(): JSX.Element {
        // The story follows the toolbar language like the page does
        const { t, language } = useT();
        return (
          <HistoryPage
            t={t}
            language={language}
            swipeRef={createRef<HTMLDivElement>()}
            sessions={sessions}
            total={sessions.length}
            loadingPhase={loadingPhase}
            isError={false}
            showNextPageSkeleton={showNextPageSkeleton}
            expandedIds={{}}
            onToggle={fn()}
            sentinelRef={createRef<HTMLDivElement>()}
            formatSessionDate={(iso: string | null): string => formatSessionDate(iso, language)}
            formatSummary={(session: WorkoutSession): string => formatSummary(session, t)}
            formatMuscleGroup={(group: MuscleGroup): string => muscleGroupLabel(group, t)}
          />
        );
      },
    });

const renderHistoryPageLoading = renderHistoryPageIn({
  sessions: [],
  loadingPhase: 'skeleton',
  showNextPageSkeleton: false,
});

/** The first page of history is still loading: the header is real, the rows are a skeleton. */
export const LoadingMobile = buildMobileStoryObj<typeof meta>({ render: renderHistoryPageLoading });

/** The next page is loading: two placeholder rows close the list. */
export const LoadingNextPageMobile = buildMobileStoryObj<typeof meta>({
  render: renderHistoryPageIn({ sessions: mockWorkoutSessions, loadingPhase: 'content', showNextPageSkeleton: true }),
});
