import { HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { ErrorCode, ResultCodes } from '@common/constants';
import { CommonResponse, ErrorItemResponse } from '@common/dto';
import { AppException } from '@common/exceptions';

export type ErrorResult = {
  status: number;
  errors: ErrorItemResponse.Dto[];
};

// A Nest exception (a bare `new NotFoundException()`, routing, body parsing) has no code of its own: its status names it.
const CODE_BY_STATUS: Partial<Record<number, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'PAYLOAD_TOO_LARGE',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
};

const codeOfStatus = (status: number): ErrorCode =>
  CODE_BY_STATUS[status] ?? (status < HttpStatus.INTERNAL_SERVER_ERROR ? 'BAD_REQUEST' : 'INTERNAL_ERROR');

type ClientHttpError = Error & { status: number; expose?: unknown };

// Express middleware fails with an `http-errors` error, not a Nest exception: body-parser's 413 for a body over the
// limit, serve-static's 404 for a missing file. Its text is shown only when it says so (`expose`) — the 404 of a file
// holds a server path.
const isClientHttpError = (exception: unknown): exception is ClientHttpError =>
  exception instanceof Error &&
  'status' in exception &&
  typeof exception.status === 'number' &&
  exception.status >= HttpStatus.BAD_REQUEST &&
  exception.status < HttpStatus.INTERNAL_SERVER_ERROR;

/** Any thrown value as the status and the error items of the response. */
export function toErrorResult(exception: unknown): ErrorResult {
  if (exception instanceof AppException) {
    return { status: exception.getStatus(), errors: exception.errors };
  }
  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    return { status, errors: [new ErrorItemResponse.Dto(codeOfStatus(status), {}, undefined, exception.message)] };
  }
  if (isClientHttpError(exception)) {
    const message = exception.expose === true ? exception.message : undefined;
    const { status } = exception;
    return { status, errors: [new ErrorItemResponse.Dto(codeOfStatus(status), {}, undefined, message)] };
  }
  return { status: HttpStatus.INTERNAL_SERVER_ERROR, errors: [new ErrorItemResponse.Dto('INTERNAL_ERROR')] };
}

// A field error keeps the "field - text" form in `messages`, the one the client shows today.
const toMessage = (error: ErrorItemResponse.Dto): string =>
  error.field ? `${error.field} - ${error.message}` : error.message;

/** The envelope of an error: the items in `fieldsErrors`, their texts in `messages`. */
export function toErrorBody(
  errors: ErrorItemResponse.Dto[],
  resultCode: number = ResultCodes.ERROR,
): CommonResponse.Dto {
  return new CommonResponse.Dto({ messages: errors.map(toMessage), fieldsErrors: errors, resultCode });
}

export function sendErrorResponse(
  response: Response,
  { status, errors }: ErrorResult,
  resultCode: number = ResultCodes.ERROR,
): void {
  response.status(status).json(toErrorBody(errors, resultCode));
}
