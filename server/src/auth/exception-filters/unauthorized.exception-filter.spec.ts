import { UnauthorizedException } from '@nestjs/common';

import { getMockArgumentsHostData } from '@test/unit/helpers';
import { ResultCodes, ErrorMessages } from '@common/constants';
import { UnauthorizedExceptionFilter } from '@auth/exception-filters';

describe('UnauthorizedExceptionFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UnauthorizedExceptionFilter - catch', () => {
    it('should send response with NEED_CAPTCHA_AUTHORIZATION code', async () => {
      const authFailedCount = '4';
      const { mockArgumentsHost, mockGetRequest, mockGetResponse, request, response } = getMockArgumentsHostData({
        sessionVariables: [{ key: 'authFailedCount', value: authFailedCount }],
      });

      const exceptionMessage = ErrorMessages.ru.INVALID_EMAIL_OR_PASSWORD;
      const errorObject = { message: exceptionMessage };

      const unauthorizedExceptionFilter = new UnauthorizedExceptionFilter();
      unauthorizedExceptionFilter.catch(new UnauthorizedException(errorObject), mockArgumentsHost);
      const body = JSON.parse(response._getData());

      expect(response._getStatusCode()).toBe(401);
      expect(mockGetResponse).toBeCalledTimes(1);
      expect(mockGetRequest).toBeCalledTimes(1);
      expect(request.session['authFailedCount']).toBe(+authFailedCount + 1);
      expect(body.resultCode).toBe(ResultCodes.NEED_CAPTCHA_AUTHORIZATION);
      expect(body.messages.length).toBe(2);
      expect(body.messages[0]).toBe(exceptionMessage);
      expect(body.messages[1]).toBe(ErrorMessages.ru.NEED_AUTHORIZATION_WITH_CAPTCHA);
    });
    it('should not send response with NEED_CAPTCHA_AUTHORIZATION code', async () => {
      const authFailedCount = '3';
      const { mockArgumentsHost, mockGetRequest, mockGetResponse, request, response } = getMockArgumentsHostData({
        sessionVariables: [{ key: 'authFailedCount', value: authFailedCount }],
      });

      const exceptionMessage = ErrorMessages.ru.INVALID_EMAIL_OR_PASSWORD;
      const errorObject = { message: exceptionMessage };

      const unauthorizedExceptionFilter = new UnauthorizedExceptionFilter();
      unauthorizedExceptionFilter.catch(new UnauthorizedException(errorObject), mockArgumentsHost);
      const body = JSON.parse(response._getData());

      expect(response._getStatusCode()).toBe(401);
      expect(mockGetResponse).toBeCalledTimes(1);
      expect(mockGetRequest).toBeCalledTimes(1);
      expect(request.session['authFailedCount']).toBe(+authFailedCount + 1);
      expect(body.resultCode).toBe(1);
      expect(body.messages.length).toBe(1);
      expect(body.messages[0]).toBe(exceptionMessage);
    });
  });
});
