import { HttpStatus } from '@nestjs/common';

import { ResultCodes } from '@common/constants';
import { ErrorItemResponse } from '@common/dto';
import { AppException } from '@common/exceptions';

describe('AppException', () => {
  it('should carry one item built by of()', () => {
    const exception = AppException.of(HttpStatus.UNAUTHORIZED, 'INVALID_EMAIL_OR_PASSWORD');
    expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    expect(exception.errors).toEqual([new ErrorItemResponse.Dto('INVALID_EMAIL_OR_PASSWORD')]);
    expect(exception.message).toBe('Invalid email or password');
    expect(exception.resultCode).toBe(ResultCodes.ERROR);
  });

  it('should carry the result code it is given', () => {
    const exception = new AppException(
      HttpStatus.UNAUTHORIZED,
      [new ErrorItemResponse.Dto('NEED_AUTHORIZATION_WITH_CAPTCHA')],
      undefined,
      ResultCodes.NEED_CAPTCHA_AUTHORIZATION,
    );
    expect(exception.resultCode).toBe(ResultCodes.NEED_CAPTCHA_AUTHORIZATION);
  });

  it('should join the texts of several items into a string message', () => {
    const exception = new AppException(HttpStatus.BAD_REQUEST, [
      new ErrorItemResponse.Dto('MUST_BE_A_STRING', {}, 'name'),
      new ErrorItemResponse.Dto('NUMERIC_MUST_NOT_BE_LESS_THAN_N', { min: 1 }, 'sets'),
    ]);
    expect(exception.message).toBe('Must be a string; Must not be less than 1');
    expect(exception.errors).toHaveLength(2);
  });
});
