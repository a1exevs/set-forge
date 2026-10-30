import { apiRequest, ApiRequestError, type CommonResponseEnvelope, getAccessToken, setAccessToken } from '@shared/api';

import { deleteAccount, deleteLogout } from '../session-api';

jest.mock('src/shared/api/http-client', () => {
  const actual = jest.requireActual('src/shared/api/http-client');
  return { ...actual, apiRequest: jest.fn() };
});

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

const okEnvelope: CommonResponseEnvelope<{ result: boolean }> = {
  data: { result: true },
  messages: [],
  fieldsErrors: [],
  resultCode: 0,
};

const failure = (status: number, code: string): ApiRequestError =>
  new ApiRequestError(status, {
    data: null,
    messages: [code],
    fieldsErrors: [{ code, params: {}, message: code }],
    resultCode: 1,
  });

describe('session-api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setAccessToken('access-token');
  });

  describe('deleteAccount', () => {
    // @invariant session/logout-ends-on-login
    it('ends the session once the account is deleted', async () => {
      mockedApiRequest.mockResolvedValue(okEnvelope);

      await expect(deleteAccount()).resolves.toBeUndefined();

      expect(mockedApiRequest).toHaveBeenCalledWith('/auth/account', { method: 'DELETE', auth: true });
      expect(getAccessToken()).toBeNull();
    });

    // @invariant session/logout-ends-on-login
    it('ends the session when the server answers that it has already ended', async () => {
      mockedApiRequest.mockRejectedValue(failure(401, 'UNAUTHORIZED'));

      await expect(deleteAccount()).resolves.toBeUndefined();

      expect(getAccessToken()).toBeNull();
    });

    // @invariant session/logout-ends-on-login
    it.each([
      ['a server error', failure(500, 'INTERNAL_ERROR')],
      ['a lost connection', failure(0, 'NETWORK_ERROR')],
    ])('keeps the session and rejects on %s', async (_case: string, error: ApiRequestError) => {
      mockedApiRequest.mockRejectedValue(error);

      await expect(deleteAccount()).rejects.toBe(error);

      expect(getAccessToken()).toBe('access-token');
    });
  });

  describe('deleteLogout', () => {
    // @invariant session/logout-ends-on-login
    it('ends the session on this device also when the request fails', async () => {
      mockedApiRequest.mockRejectedValue(failure(500, 'INTERNAL_ERROR'));

      await expect(deleteLogout()).rejects.toBeInstanceOf(ApiRequestError);

      expect(getAccessToken()).toBeNull();
    });
  });
});
