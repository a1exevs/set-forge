import { act, renderHook, waitFor } from '@testing-library/react';

import { useDeleteAccountMutation } from '@entities/session';

import { useDeleteAccount } from '../use-delete-account';

const navigateMock = jest.fn();

jest.mock('@tanstack/react-router', () => ({
  useNavigate: (): typeof navigateMock => navigateMock,
}));

jest.mock('@entities/session', () => ({
  useDeleteAccountMutation: jest.fn(),
}));

const mockedDeleteAccountMutation = useDeleteAccountMutation as jest.Mock;

describe('useDeleteAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes the account and goes to /login', async () => {
    const mutateAsync = jest.fn().mockResolvedValue(undefined);
    mockedDeleteAccountMutation.mockReturnValue({ mutateAsync, isPending: false });
    const { result } = renderHook(() => useDeleteAccount());

    await act(() => result.current.deleteAccount());

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith({ to: '/login' });
  });

  // @invariant session/logout-ends-on-login
  it('still goes to /login when the request fails', async () => {
    mockedDeleteAccountMutation.mockReturnValue({
      mutateAsync: jest.fn().mockRejectedValue(new Error('offline')),
      isPending: false,
    });
    const { result } = renderHook(() => useDeleteAccount());

    await act(() => result.current.deleteAccount());

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith({ to: '/login' }));
  });

  it('exposes the pending state', () => {
    mockedDeleteAccountMutation.mockReturnValue({ mutateAsync: jest.fn(), isPending: true });
    const { result } = renderHook(() => useDeleteAccount());

    expect(result.current.isPending).toBe(true);
  });
});
