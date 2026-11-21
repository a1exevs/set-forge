import { HttpException, HttpStatus } from '@nestjs/common';

import { ErrorCode, ErrorParams } from '@common/constants/error-messages';
import { ResultCodes } from '@common/constants/result-codes';
import { ErrorItemResponse } from '@common/dto/error-item.response';

export type AppExceptionOptions = {
  /** An internal failure behind the error — logged, never sent. */
  readonly cause?: Error;
  /** What the client should do next. */
  readonly resultCode?: number;
  /** Headers the answer carries (`Retry-After`). */
  readonly headers?: Readonly<Record<string, string>>;
};

/** An error the server raises on purpose: its items carry the codes; `message` joins their texts for logs. */
export class AppException extends HttpException {
  readonly errors: ErrorItemResponse.Dto[];
  readonly resultCode: number;
  readonly headers: Readonly<Record<string, string>>;

  constructor(status: HttpStatus, errors: ErrorItemResponse.Dto[], options: AppExceptionOptions = {}) {
    const { cause, resultCode = ResultCodes.ERROR, headers = {} } = options;
    super(errors.map(error => error.message).join('; '), status, cause ? { cause } : undefined);
    this.errors = errors;
    this.resultCode = resultCode;
    this.headers = headers;
  }

  static of(status: HttpStatus, code: ErrorCode, params: ErrorParams = {}, cause?: Error): AppException {
    return new AppException(status, [new ErrorItemResponse.Dto(code, params)], { cause });
  }
}
