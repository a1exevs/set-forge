import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SKIP_ENVELOPE_KEY } from '@common/decorators';
import { CommonResponse } from '@common/dto';

/** Every successful response leaves in the envelope, except the routes marked with `@SkipEnvelope()`. */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, CommonResponse.Dto | T> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<CommonResponse.Dto | T> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_ENVELOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) {
      return next.handle();
    }
    return next.handle().pipe(map(data => new CommonResponse.Dto({ data })));
  }
}
