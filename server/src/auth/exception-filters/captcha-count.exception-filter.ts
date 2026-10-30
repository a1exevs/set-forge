import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

import { MAX_AUTH_FAILED_COUNT } from '@auth/guards';
import { Isession } from '@auth/interfaces';
import { ResultCodes } from '@common/constants';
import { ErrorItemResponse } from '@common/dto';
import { HttpExceptionFilter } from '@common/exception-filters';
import { ErrorResult, sendErrorResponse } from '@common/functions';

/**
 * Bound to the login only: its 401s are the failed sign-ins that lead to the captcha; a 401 anywhere else (an expired
 * session) never counts — invariant session/captcha-counts-login-only.
 */
@Catch()
export class CaptchaCountExceptionFilter extends HttpExceptionFilter {
  protected respond(result: ErrorResult, host: ArgumentsHost): void {
    if (result.status !== HttpStatus.UNAUTHORIZED) {
      super.respond(result, host);
      return;
    }

    const ctx = host.switchToHttp();
    const session = ctx.getRequest<Request & { session: Isession }>().session;
    session.authFailedCount = session.authFailedCount ? ++session.authFailedCount : 1;

    const response = ctx.getResponse<Response>();
    if (response.headersSent) {
      return;
    }

    if (session.authFailedCount < MAX_AUTH_FAILED_COUNT) {
      sendErrorResponse(response, result);
      return;
    }

    const needsCaptcha = result.errors.some(error => error.code === 'NEED_AUTHORIZATION_WITH_CAPTCHA');
    const errors = needsCaptcha
      ? result.errors
      : [...result.errors, new ErrorItemResponse.Dto('NEED_AUTHORIZATION_WITH_CAPTCHA')];
    sendErrorResponse(response, { ...result, errors }, ResultCodes.NEED_CAPTCHA_AUTHORIZATION);
  }
}
