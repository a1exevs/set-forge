import { HttpStatus } from '@nestjs/common';

import { UnauthorizedExceptionFilter } from '@auth/exception-filters';
import { ErrorMessages, ResultCodes } from '@common/constants';
import { AppException } from '@common/exceptions';
import { getMockArgumentsHostData } from '@test/unit/helpers';

describe('UnauthorizedExceptionFilter', () => {
  const invalidCredentials = (): AppException => AppException.of(HttpStatus.UNAUTHORIZED, 'INVALID_EMAIL_OR_PASSWORD');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should demand the captcha when the failed sign-ins reach the limit', () => {
    const { mockArgumentsHost, request, response } = getMockArgumentsHostData({
      sessionVariables: [{ key: 'authFailedCount', value: '4' }],
    });
    new UnauthorizedExceptionFilter().catch(invalidCredentials(), mockArgumentsHost);
    const body = JSON.parse(response._getData());

    expect(response._getStatusCode()).toBe(HttpStatus.UNAUTHORIZED);
    expect(request.session['authFailedCount']).toBe(5);
    expect(body.resultCode).toBe(ResultCodes.NEED_CAPTCHA_AUTHORIZATION);
    expect(body.messages).toEqual([
      ErrorMessages.INVALID_EMAIL_OR_PASSWORD,
      ErrorMessages.NEED_AUTHORIZATION_WITH_CAPTCHA,
    ]);
    expect(body.fieldsErrors.map(error => error.code)).toEqual([
      'INVALID_EMAIL_OR_PASSWORD',
      'NEED_AUTHORIZATION_WITH_CAPTCHA',
    ]);
  });

  it('should count a failed sign-in below the limit without the captcha', () => {
    const { mockArgumentsHost, request, response } = getMockArgumentsHostData({
      sessionVariables: [{ key: 'authFailedCount', value: '3' }],
    });
    new UnauthorizedExceptionFilter().catch(invalidCredentials(), mockArgumentsHost);
    const body = JSON.parse(response._getData());

    expect(request.session['authFailedCount']).toBe(4);
    expect(body.resultCode).toBe(ResultCodes.ERROR);
    expect(body.messages).toEqual([ErrorMessages.INVALID_EMAIL_OR_PASSWORD]);
  });

  it('should not repeat the captcha item of a wrong captcha', () => {
    const { mockArgumentsHost, response } = getMockArgumentsHostData({
      sessionVariables: [{ key: 'authFailedCount', value: '5' }],
    });
    const wrongCaptcha = AppException.of(HttpStatus.UNAUTHORIZED, 'NEED_AUTHORIZATION_WITH_CAPTCHA');
    new UnauthorizedExceptionFilter().catch(wrongCaptcha, mockArgumentsHost);
    const body = JSON.parse(response._getData());

    expect(body.resultCode).toBe(ResultCodes.NEED_CAPTCHA_AUTHORIZATION);
    expect(body.messages).toEqual([ErrorMessages.NEED_AUTHORIZATION_WITH_CAPTCHA]);
  });

  it('should not count an error other than 401', () => {
    const { mockArgumentsHost, request, response } = getMockArgumentsHostData({
      sessionVariables: [{ key: 'authFailedCount', value: '4' }],
    });
    new UnauthorizedExceptionFilter().catch(
      AppException.of(HttpStatus.BAD_REQUEST, 'MUST_BE_A_STRING'),
      mockArgumentsHost,
    );
    const body = JSON.parse(response._getData());

    expect(response._getStatusCode()).toBe(HttpStatus.BAD_REQUEST);
    expect(request.session['authFailedCount']).toBe('4');
    expect(body.resultCode).toBe(ResultCodes.ERROR);
  });
});
