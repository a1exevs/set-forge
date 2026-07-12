import type { WorkoutSession } from '@entities';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const baseProps = {
  sessions: [SESSION],
  total: 1,
  isLoading: false,
  isError: false,
  isFetchingNextPage: false,
  expandedIds: {},
  onToggle: (): void => undefined,
  sentinelRef: createRef<HTMLDivElement>(),
  formatSessionDate: (iso: string | null): string => iso ?? '',
  formatSummary: (): string => '1/1 exercise · 60 min',
};

describe('HistoryPage', () => {
  it('renders the header, total count and a session card', () => {
    render(<HistoryPage {...baseProps} />);

    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('1 workout')).toBeInTheDocument();
    expect(screen.getByText('Push Day')).toBeInTheDocument();
    expect(screen.getByText('1/1 exercise · 60 min')).toBeInTheDocument();
    expect(screen.getByTestId('main-tabs-bar')).toBeInTheDocument();
  });

  it('shows the loading state', () => {
    render(<HistoryPage {...baseProps} sessions={[]} total={0} isLoading />);

    expect(screen.getByText('Loading history…')).toBeInTheDocument();
  });

  it('shows the error state', () => {
    render(<HistoryPage {...baseProps} sessions={[]} total={0} isError />);

    expect(screen.getByText('Could not load your workout history')).toBeInTheDocument();
  });

  it('shows the empty state when there are no sessions', () => {
    render(<HistoryPage {...baseProps} sessions={[]} total={0} />);

    expect(screen.getByText('No completed workouts yet')).toBeInTheDocument();
  });

  it('hides collapsed exercise details and reveals them when expanded', () => {
    const { rerender } = render(<HistoryPage {...baseProps} />);

    expect(screen.queryByText('Bench Press')).not.toBeInTheDocument();

    rerender(<HistoryPage {...baseProps} expandedIds={{ 'sess-1': true }} />);

    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('3/3')).toBeInTheDocument();
  });

  it('calls onToggle when a card header is clicked', async () => {
    const onToggle = jest.fn();
    const user = userEvent.setup();

    render(<HistoryPage {...baseProps} onToggle={onToggle} />);

    await user.click(screen.getByRole('button', { expanded: false }));

    expect(onToggle).toHaveBeenCalledWith('sess-1');
  });
});
