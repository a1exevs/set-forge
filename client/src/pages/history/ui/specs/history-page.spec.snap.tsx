import type { WorkoutSession } from '@entities';
import { render } from '@testing-library/react';
import { createRef } from 'react';

import HistoryPage from 'src/pages/history/ui/history-page';

jest.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (state: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: '/history' } }),
}));

jest.mock('@widgets', () => ({
  MainTabsBar: (): JSX.Element => <nav data-testid="main-tabs-bar" />,
  MAIN_TAB_ROUTES: [
    { id: 'home', to: '/' },
    { id: 'history', to: '/history' },
    { id: 'profile', to: '/profile' },
  ],
}));

jest.mock('@shared', () => {
  const actual = jest.requireActual<typeof import('@shared')>('@shared');
  return {
    ...actual,
    useTabSwipeNavigation: () => ({ current: null }),
  };
});

const SESSION: WorkoutSession = {
  id: 'sess-1',
  workoutListId: 'list-1',
  workoutListName: 'Push Day',
  status: 'completed',
  startedAt: '2026-06-03T12:00:00.000Z',
  finishedAt: '2026-06-03T13:00:00.000Z',
  exercises: [
    {
      id: 'ex-1',
      sourceExerciseId: 'tpl-1',
      name: 'Bench Press',
      muscleGroup: 'chest',
      weight: 60,
      reps: 10,
      sets: 3,
      completedSets: 3,
    },
  ],
};

describe('HistoryPage', () => {
  it('matches snapshot with an expanded session', () => {
    const { container } = render(
      <HistoryPage
        sessions={[SESSION]}
        total={1}
        isLoading={false}
        isError={false}
        isFetchingNextPage={false}
        expandedIds={{ 'sess-1': true }}
        onToggle={(): void => undefined}
        sentinelRef={createRef<HTMLDivElement>()}
        formatSessionDate={(iso): string => iso ?? ''}
        formatSummary={(): string => '1/1 exercise · 60 min'}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
