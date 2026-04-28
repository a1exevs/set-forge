import { HttpStatus } from '@nestjs/common';

import { getMockJWTServiceData, getMockExecutionContextData, sendPseudoError } from '@test/unit/helpers';
import { RefreshTokenGuard } from '@common/guards';
import { ErrorMessages } from '@common/constants';

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
    it('should throw exception (no token in cookies)', async () => {
      const { mockContext, mockGetRequest } = getMockExecutionContextData({});
      const refreshTokenGuard = new RefreshTokenGuard();

      try {
        refreshTokenGuard.canActivate(mockContext);
        sendPseudoError();
      } catch (err) {
        expect(err.status).toBe(HttpStatus.FORBIDDEN);
        expect(err.message).toBe(ErrorMessages.ru.FORBIDDEN);
        expect(mockGetRequest).toBeCalledTimes(1);
      }
    });
  });
});
