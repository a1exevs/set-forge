import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

import { sendResponse } from '@common/functions';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    sendResponse(exception, response);
  }
}
