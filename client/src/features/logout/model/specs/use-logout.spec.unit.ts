import { act, renderHook } from '@testing-library/react';

import { useClearSessionCache, useLogoutMutation } from '@entities/session';

import { useLogout } from '../use-logout';

const navigateMock = jest.fn();

jest.mock('@tanstack/react-router', () => ({
  useNavigate: (): typeof navigateMock => navigateMock,
}));

jest.mock('@entities/session', () => ({
  useLogoutMutation: jest.fn(),
  useClearSessionCache: jest.fn(),
}));

const mockedLogoutMutation = useLogoutMutation as jest.Mock;
const clearSessionCacheMock = jest.fn();
(useClearSessionCache as jest.Mock).mockReturnValue(clearSessionCacheMock);

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs out without leaving the page or clearing the cache — the caller leaves', async () => {
    const mutateAsync = jest.fn().mockResolvedValue(undefined);
    mockedLogoutMutation.mockReturnValue({ mutateAsync });
    const { result } = renderHook(() => useLogout());

    await act(() => result.current.logout());

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(navigateMock).not.toHaveBeenCalled();
    expect(clearSessionCacheMock).not.toHaveBeenCalled();
  });

  // @invariant session/logout-ends-on-login
  it('resolves when the request fails, so the caller still leaves', async () => {
    mockedLogoutMutation.mockReturnValue({ mutateAsync: jest.fn().mockRejectedValue(new Error('offline')) });
    const { result } = renderHook(() => useLogout());

    await expect(result.current.logout()).resolves.toBeUndefined();
  });

  it('clears every cached query, then leaves for /login', () => {
    mockedLogoutMutation.mockReturnValue({ mutateAsync: jest.fn() });
    const { result } = renderHook(() => useLogout());

    result.current.leave();

    expect(clearSessionCacheMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith({ to: '/login' });
    expect(clearSessionCacheMock.mock.invocationCallOrder[0]).toBeLessThan(
      navigateMock.mock.invocationCallOrder[0] ?? 0,
    );
  });
});
