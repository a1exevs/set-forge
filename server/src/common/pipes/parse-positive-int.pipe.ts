import { ArgumentMetadata, HttpStatus, Injectable, ParseIntPipe, PipeTransform } from '@nestjs/common';

import { AppException } from '@common/exceptions';

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<unknown> {
  async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    const intPipe = new ParseIntPipe({
      exceptionFactory: () => AppException.of(HttpStatus.BAD_REQUEST, 'MUST_BE_AN_INTEGER_NUMBER'),
    });
    const parsed = await intPipe.transform(String(value), metadata);

    if (parsed < 0) {
      throw AppException.of(HttpStatus.BAD_REQUEST, 'NUMERIC_MUST_NOT_BE_LESS_THAN_N', { min: 0 });
    }

    return value;
  }
}
