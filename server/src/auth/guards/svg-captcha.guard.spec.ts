import { UnauthorizedException } from '@nestjs/common';

import { MAX_AUTH_FAILED_COUNT, SvgCaptchaGuard } from '@auth/guards';
import { getMockExecutionContextData } from '@test/unit/helpers';

describe('SwgCaptchaGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('canActivate', () => {
    it('captcha text correct. Authorization failed MAX times', async () => {
      const authFailedCount = `${MAX_AUTH_FAILED_COUNT}`;
      const captchaText = '1234';
      const loginDto = { email: 'user@yandex.ru', password: '12345678', captcha: captchaText };
      const { mockContext, mockGetRequest, request } = getMockExecutionContextData({
        sessionVariables: [
          { key: 'authFailedCount', value: authFailedCount },
          { key: 'captcha', value: captchaText },
        ],
        body: loginDto,
      });

      const captchaGuard = new SvgCaptchaGuard();
      const result = captchaGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockGetRequest).toBeCalledTimes(1);
      expect(request.session['captcha']).toBeNull();
    });
    it('captcha text correct. Authorization failed MAX+1 times', async () => {
      const authFailedCount = `${MAX_AUTH_FAILED_COUNT + 1}`;
      const captchaText = '1234';
      const loginDto = { email: 'user@yandex.ru', password: '12345678', captcha: captchaText };
      const { mockContext, mockGetRequest, request } = getMockExecutionContextData({
        sessionVariables: [
          { key: 'authFailedCount', value: authFailedCount },
          { key: 'captcha', value: captchaText },
        ],
        body: loginDto,
      });

      const captchaGuard = new SvgCaptchaGuard();
      const result = captchaGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockGetRequest).toBeCalledTimes(1);
      expect(request.session['captcha']).toBeNull();
    });
    it('captcha text incorrect', async () => {
      const authFailedCount = `${MAX_AUTH_FAILED_COUNT}`;
      const correctCaptchaText = '1234';
      const incorrectCaptchaText = '1254';
      const loginDto = { email: 'user@yandex.ru', password: '12345678', captcha: incorrectCaptchaText };
      const { mockContext, mockGetRequest, request } = getMockExecutionContextData({
        sessionVariables: [
          { key: 'authFailedCount', value: authFailedCount },
          { key: 'captcha', value: correctCaptchaText },
        ],
        body: loginDto,
      });

      const captchaGuard = new SvgCaptchaGuard();

      expect(() => captchaGuard.canActivate(mockContext)).toThrow(UnauthorizedException);
      expect(mockGetRequest).toBeCalledTimes(1);
      expect(request.session['captcha']).toBeNull();
    });
    it('captcha text correct. Authorization failed MAX-1 times', async () => {
      const authFailedCount = `${MAX_AUTH_FAILED_COUNT - 1}`;
      const loginDto = { email: 'user@yandex.ru', password: '12345678' };
      const { mockContext, mockGetRequest, request } = getMockExecutionContextData({
        sessionVariables: [{ key: 'authFailedCount', value: authFailedCount }],
        body: loginDto,
      });

      const captchaGuard = new SvgCaptchaGuard();
      const result = captchaGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockGetRequest).toBeCalledTimes(1);
      expect(request.session['captcha']).toBeNull();
    });
  });
});
