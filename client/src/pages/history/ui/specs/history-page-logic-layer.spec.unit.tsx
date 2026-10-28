import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';

import type { WorkoutSession } from '@entities/workout-session';

import HistoryPageLogicLayer from '../history-page-logic-layer';

jest.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

jest.mock('@widgets/main-tabs-bar', () => ({
  MainTabsBar: (): JSX.Element => <nav />,
  useMainTabSwipe: (): { current: null } => ({ current: null }),
}));

const SESSION: WorkoutSession = {
  id: 'sess-1',
  workoutListId: 'list-1',
  workoutListName: 'Push Day',
  status: 'completed',
  startedAt: '2026-06-01T10:00:00.000Z',
  finishedAt: '2026-06-01T11:00:00.000Z',
  exercises: [],
};

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

describe('HistoryPageLogicLayer', () => {
  const observed: { callback: ObserverCallback; node: Element }[] = [];

  beforeEach(() => {
    jest.useFakeTimers();
    observed.length = 0;
    window.IntersectionObserver = jest.fn((callback: ObserverCallback) => ({
      observe: (node: Element): void => {
        observed.push({ callback, node });
      },
      disconnect: (): void => undefined,
    })) as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('loads the next page once the skeleton of the first one has gone', () => {
    const fetchNextPage = jest.fn();
    const props = { total: 25, isError: false, isFetchingNextPage: false, hasMore: true, fetchNextPage };
    const { rerender } = render(<HistoryPageLogicLayer {...props} sessions={[]} isLoading />);

    act(() => {
      jest.advanceTimersByTime(300);
    });
    // The first page answers while its skeleton is still held: the list and its sentinel come once the hold ends
    rerender(<HistoryPageLogicLayer {...props} sessions={[SESSION]} isLoading={false} />);
    act(() => {
      jest.advanceTimersByTime(500);
    });

    const sentinel = observed.at(-1);
    expect(sentinel).toBeDefined();
    act(() => {
      sentinel?.callback([{ isIntersecting: true }]);
    });

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });
});
