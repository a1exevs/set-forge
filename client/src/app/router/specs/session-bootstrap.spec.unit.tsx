import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createTestQueryClient, createTestRouter, renderApp } from './test-utils';

jest.mock('src/entities/workout-list/api/workout-list-api', () => ({
  fetchWorkoutLists: jest.fn().mockResolvedValue([]),
  fetchWorkoutList: jest.fn().mockResolvedValue(null),
  createWorkoutList: jest.fn(),
  updateWorkoutList: jest.fn(),
  deleteWorkoutList: jest.fn(),
  exportAllWorkoutLists: jest.fn(),
  importWorkoutLists: jest.fn(),
}));

jest.mock('src/entities/workout-session/api/workout-session-api', () => ({
  fetchActiveWorkoutSession: jest.fn().mockResolvedValue(null),
  fetchWorkoutHistory: jest.fn().mockResolvedValue({ items: [], total: 0 }),
  startWorkoutSession: jest.fn(),
  incrementSessionProgress: jest.fn(),
  finishWorkoutSession: jest.fn(),
  resyncWorkoutSession: jest.fn(),
  discardWorkoutSession: jest.fn(),
}));

// The current-user request behind `useCurrentUserQuery`: the pages must never trigger it on their own.
jest.mock('src/entities/session/api/session-api', () => ({
  ...jest.requireActual('src/entities/session/api/session-api'),
  fetchCurrentUser: jest.fn().mockResolvedValue(null),
}));

// The session bootstrap is mocked for every test in tests/common/setup-testing-library.ts (it primes a user and
// returns it); this spec counts its calls and overrides the answer where a guest is needed.
const { bootstrapSessionAndPrimeCache } = jest.requireMock<{ bootstrapSessionAndPrimeCache: jest.Mock }>(
  'src/entities/session/model/bootstrap-session',
);
const { fetchCurrentUser } = jest.requireMock<{ fetchCurrentUser: jest.Mock }>('src/entities/session/api/session-api');

const SIGNED_IN_USER = { id: 1, email: 'test@example.com', documentsPendingAcceptance: false };

describe('Session bootstrap in the router', () => {
  beforeEach((): void => {
    bootstrapSessionAndPrimeCache.mockClear();
    fetchCurrentUser.mockClear();
  });

  // @invariant session/bootstrap-once
  it('verifies the session once per app open — navigation and link intent never bootstrap again', async () => {
    const queryClient = createTestQueryClient();
    const router = createTestRouter('/', queryClient);
    renderApp(router, queryClient);

    await screen.findByText('Workout lists');
    expect(bootstrapSessionAndPrimeCache).toHaveBeenCalledTimes(1);

    // Link intent: hover, touch and focus on every main tab and the "create" link.
    const user = userEvent.setup();
    const links = [...screen.getAllByRole('tab'), screen.getByRole('link', { name: /Create workout list/i })];
    for (const link of links) {
      await user.hover(link);
      await act(async () => {
        link.focus();
      });
    }
    await user.pointer({ keys: '[TouchA>]', target: links[0] });
    await user.pointer({ keys: '[/TouchA]' });

    // Navigation between protected screens, in both directions.
    await act(() => router.navigate({ to: '/history' }));
    await screen.findByText('No completed workouts yet');
    await act(() => router.navigate({ to: '/profile' }));
    await screen.findByRole('button', { name: 'Log out' });
    await act(() => router.navigate({ to: '/create' }));
    await screen.findByText('New Workout List');
    await act(() => router.navigate({ to: '/' }));
    await screen.findByText('Workout lists');

    expect(bootstrapSessionAndPrimeCache).toHaveBeenCalledTimes(1);
    // The pages read the user from the cache; none of them asked the server again.
    expect(fetchCurrentUser).not.toHaveBeenCalled();
  });

  // @invariant session/route-guards
  describe('route guards', () => {
    it('sends a guest from a protected route to /login with the return path, after one bootstrap', async () => {
      bootstrapSessionAndPrimeCache.mockResolvedValueOnce(null);
      const queryClient = createTestQueryClient();
      const router = createTestRouter('/history', queryClient);
      renderApp(router, queryClient);

      await screen.findByRole('heading', { name: 'Set Forge' });
      expect(router.state.location.pathname).toBe('/login');
      expect(router.state.location.search).toEqual({ redirect: '/history' });
      expect(bootstrapSessionAndPrimeCache).toHaveBeenCalledTimes(1);
    });

    it('shows the legal pages to a guest without a session check', async () => {
      const queryClient = createTestQueryClient();
      const router = createTestRouter('/privacy', queryClient);
      renderApp(router, queryClient);

      await screen.findByRole('heading', { name: /Политика обработки персональных данных|Privacy Policy/ });
      expect(router.state.location.pathname).toBe('/privacy');
      expect(bootstrapSessionAndPrimeCache).not.toHaveBeenCalled();
    });

    it('sends a signed-in user from the auth pages home without a session check', async () => {
      const queryClient = createTestQueryClient();
      queryClient.setQueryData(['session', 'me'], SIGNED_IN_USER);
      const router = createTestRouter('/login', queryClient);
      renderApp(router, queryClient);

      await screen.findByText('Workout lists');
      expect(router.state.location.pathname).toBe('/');
      expect(bootstrapSessionAndPrimeCache).not.toHaveBeenCalled();
    });
  });
});
