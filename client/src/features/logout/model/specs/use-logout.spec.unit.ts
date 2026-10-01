import { act, renderHook, waitFor } from '@testing-library/react';

import { useLogoutMutation } from '@entities/session';

import { useLogout } from '../use-logout';

const navigateMock = jest.fn();

jest.mock('@tanstack/react-router', () => ({
  useNavigate: (): typeof navigateMock => navigateMock,
}));

jest.mock('@entities/session', () => ({
  useLogoutMutation: jest.fn(),
}));

const mockedLogoutMutation = useLogoutMutation as jest.Mock;

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs out and goes to /login', async () => {
    const mutateAsync = jest.fn().mockResolvedValue(undefined);
    mockedLogoutMutation.mockReturnValue({ mutateAsync, isPending: false });
    const { result } = renderHook(() => useLogout());

    act(() => result.current.logout());

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith({ to: '/login' }));
  });

  // @invariant session/logout-ends-on-login
  it('still goes to /login when the request fails', async () => {
    mockedLogoutMutation.mockReturnValue({
      mutateAsync: jest.fn().mockRejectedValue(new Error('offline')),
      isPending: false,
    });
    const { result } = renderHook(() => useLogout());

    act(() => result.current.logout());

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith({ to: '/login' }));
  });

  it('exposes the pending state', () => {
    mockedLogoutMutation.mockReturnValue({ mutateAsync: jest.fn(), isPending: true });
    const { result } = renderHook(() => useLogout());

    expect(result.current.isPending).toBe(true);
  });
});
