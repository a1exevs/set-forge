import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

import { ErrorResult, sendErrorResponse, toErrorResult } from '@common/functions';

/** Every error of every route leaves in the envelope; a crash, or an internal failure behind an error, is logged. */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const result = toErrorResult(exception);
    this.log(exception, result);
    this.respond(result, host);
  }

  /** A route filter that extends this one adds its own handling of the result here. */
  protected respond(result: ErrorResult, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    if (response.headersSent) {
      return;
    }
    sendErrorResponse(response, result);
  }

  private log(exception: unknown, { status }: ErrorResult): void {
    const cause = exception instanceof HttpException && exception.cause instanceof Error ? exception.cause : null;
    if (cause) {
      this.logger.error(cause.stack);
    } else if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }
  }
}
