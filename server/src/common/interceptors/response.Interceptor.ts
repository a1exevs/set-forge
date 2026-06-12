import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CommonResponse } from '@common/dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, CommonResponse.Dto> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<CommonResponse.Dto> {
    return next.handle().pipe(
      map(data => {
        return new CommonResponse.Dto({ data });
      }),
    );
  }
}
