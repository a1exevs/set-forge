import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';

import { t, tRu } from 'tests/common/translate';

import { type MuscleGroup, muscleGroupLabel } from '@entities/workout-exercise';
import type { WorkoutSession } from '@entities/workout-session';

import HistoryPage from '../history-page';

jest.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (state: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: '/history' } }),
}));

jest.mock('@widgets/main-tabs-bar', () => ({
  MainTabsBar: (): JSX.Element => <nav data-testid="main-tabs-bar" />,
}));

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
  t,
  language: 'en' as const,
  swipeRef: createRef<HTMLDivElement>(),
  sessions: [SESSION],
  total: 1,
  loadingPhase: 'content' as const,
  isError: false,
  showNextPageSkeleton: false,
  expandedIds: {},
  onToggle: (): void => undefined,
  sentinelRef: createRef<HTMLDivElement>(),
  formatSessionDate: (iso: string | null): string => iso ?? '',
  formatSummary: (): string => '1/1 exercise · 60 min',
  formatMuscleGroup: (group: MuscleGroup): string => muscleGroupLabel(group, t),
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

  it('shows the skeleton while history loads', () => {
    render(<HistoryPage {...baseProps} sessions={[]} total={0} loadingPhase="skeleton" />);

    expect(screen.getByRole('status', { name: 'Loading history' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Loading history…')).not.toBeInTheDocument();
  });

  it('shows nothing in the body during the first 300 ms of loading', () => {
    render(<HistoryPage {...baseProps} sessions={[]} total={0} loadingPhase="blank" />);

    expect(screen.queryByRole('status', { name: 'Loading history' })).not.toBeInTheDocument();
    expect(screen.queryByText('No completed workouts yet')).not.toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
  });

  it('closes the list with two placeholder rows while the next page loads', () => {
    const { container } = render(<HistoryPage {...baseProps} showNextPageSkeleton />);

    const placeholder = screen.getByRole('status', { name: 'Loading more history' });
    expect(placeholder.children).toHaveLength(2);
    expect(container).not.toHaveTextContent('Loading more…');
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

  // AC-2 of #112: workouts and reps in the plural form of the language
  it.each([
    ['ru', 1, '1 тренировка'],
    ['ru', 2, '2 тренировки'],
    ['ru', 5, '5 тренировок'],
    ['ru', 11, '11 тренировок'],
    ['ru', 21, '21 тренировка'],
    ['ru', 22, '22 тренировки'],
    ['en', 1, '1 workout'],
    ['en', 2, '2 workouts'],
  ] as const)('counts %s workouts: %i', (language, total, text) => {
    render(<HistoryPage {...baseProps} t={language === 'ru' ? tRu : t} language={language} total={total} />);

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it.each([
    ['ru', 1, '60 кг × 1 повтор'],
    ['ru', 2, '60 кг × 2 повтора'],
    ['ru', 5, '60 кг × 5 повторов'],
    ['ru', 11, '60 кг × 11 повторов'],
    ['ru', 21, '60 кг × 21 повтор'],
    ['ru', 22, '60 кг × 22 повтора'],
    ['en', 1, '60 kg × 1 rep'],
    ['en', 2, '60 kg × 2 reps'],
  ] as const)('shows the reps in %s: %i', (language, reps, text) => {
    const [session] = baseProps.sessions;
    if (!session) {
      throw new Error('no session in the fixture');
    }
    const withReps = { ...session, exercises: session.exercises.map(exercise => ({ ...exercise, weight: 60, reps })) };
    render(
      <HistoryPage
        {...baseProps}
        t={language === 'ru' ? tRu : t}
        language={language}
        sessions={[withReps]}
        expandedIds={{ [withReps.id]: true }}
      />,
    );

    expect(screen.getAllByText(text).length).toBeGreaterThan(0);
  });
});
