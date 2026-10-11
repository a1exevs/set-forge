import { HttpStatus } from '@nestjs/common';

import { ErrorMessages } from '@common/constants';
import { RefreshTokenGuard } from '@common/guards';
import { getMockExecutionContextData, getMockJWTServiceData, sendPseudoError } from '@test/unit/helpers';

describe('RefreshTokenGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('canActivate', () => {
    it('should be successful result', async () => {
      const userId = 1;
      const tokenUUID = '1dsfsdf';
      const { token } = getMockJWTServiceData({
        expiresIn: `600s`,
        payload: {},
        subject: `${userId}`,
        jwtId: `${tokenUUID}`,
      });
      const { mockContext, mockGetRequest } = getMockExecutionContextData({
        cookiesVariable: [{ key: 'refreshToken', value: token }],
      });

      const refreshTokenGuard = new RefreshTokenGuard();
      const result = refreshTokenGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockGetRequest).toBeCalledTimes(1);
    });
    // A request without the session cookie carries no session credential: 401, like a missing access token.
    it('should throw 401 Unauthorized (no token in cookies)', async () => {
      const { mockContext, mockGetRequest } = getMockExecutionContextData({});
      const refreshTokenGuard = new RefreshTokenGuard();

      try {
        refreshTokenGuard.canActivate(mockContext);
        sendPseudoError();
      } catch (err) {
        expect(err.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(err.message).toBe(ErrorMessages.UNAUTHORIZED);
        expect(mockGetRequest).toBeCalledTimes(1);
      }
    });
    it('should throw 401 Unauthorized (no cookies on the request at all)', async () => {
      const { mockContext, request } = getMockExecutionContextData({});
      delete (request as { cookies?: unknown }).cookies;
      const refreshTokenGuard = new RefreshTokenGuard();

      try {
        refreshTokenGuard.canActivate(mockContext);
        sendPseudoError();
      } catch (err) {
        expect(err.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(err.message).toBe(ErrorMessages.UNAUTHORIZED);
      }
    });
  });
});
