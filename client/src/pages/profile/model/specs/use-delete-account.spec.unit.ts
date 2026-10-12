import { act, renderHook } from '@testing-library/react';

import { useDeleteAccountMutation } from '@entities/session';

import { useDeleteAccount } from '../use-delete-account';

jest.mock('@entities/session', () => ({
  useDeleteAccountMutation: jest.fn(),
}));

const mockedDeleteAccountMutation = useDeleteAccountMutation as jest.Mock;

describe('useDeleteAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes the account', async () => {
    const mutateAsync = jest.fn().mockResolvedValue(undefined);
    mockedDeleteAccountMutation.mockReturnValue({ mutateAsync });
    const { result } = renderHook(() => useDeleteAccount());

    await act(() => result.current.deleteAccount());

    expect(mutateAsync).toHaveBeenCalledTimes(1);
  });

  // @invariant session/logout-ends-on-login
  it('resolves when the request fails, so the caller still goes to /login', async () => {
    mockedDeleteAccountMutation.mockReturnValue({
      mutateAsync: jest.fn().mockRejectedValue(new Error('offline')),
    });
    const { result } = renderHook(() => useDeleteAccount());

    await expect(result.current.deleteAccount()).resolves.toBeUndefined();
  });
});
