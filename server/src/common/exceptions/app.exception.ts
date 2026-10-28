import { HttpException, HttpStatus } from '@nestjs/common';

import { ErrorCode, ErrorParams } from '@common/constants/error-messages';
import { ErrorItemResponse } from '@common/dto/error-item.response';

/**
 * An error the server raises on purpose: its items carry the codes; `message` joins their texts for logs. `cause` is
 * an internal failure behind it — logged, never sent.
 */
export class AppException extends HttpException {
  readonly errors: ErrorItemResponse.Dto[];

  constructor(status: HttpStatus, errors: ErrorItemResponse.Dto[], cause?: Error) {
    super(errors.map(error => error.message).join('; '), status, cause ? { cause } : undefined);
    this.errors = errors;
  }

  static of(status: HttpStatus, code: ErrorCode, params: ErrorParams = {}, cause?: Error): AppException {
    return new AppException(status, [new ErrorItemResponse.Dto(code, params)], cause);
  }
}
