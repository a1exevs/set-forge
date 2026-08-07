import { ArgumentMetadata, Injectable, ParseIntPipe, PipeTransform } from '@nestjs/common';

import { ErrorMessages } from '@common/constants';
import { ValidationException } from '@common/exceptions';

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const intPipe = new ParseIntPipe();
    await intPipe.transform(value, metadata);

    if (value < 0) {
      throw new ValidationException(ErrorMessages.NUMERIC_MUST_NOT_BE_LESS_THAN_N.format(0));
    }

    return value;
  }
}
