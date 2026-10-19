import { ArgumentMetadata, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

import { ErrorItemResponse } from '@common/dto';
import { AppException } from '@common/exceptions';
import { isValidationErrorContext } from '@common/utils';

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const errors = await validate(plainToInstance(metatype, value));

    if (errors.length) {
      throw new AppException(HttpStatus.BAD_REQUEST, toErrorItems(errors));
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

/**
 * One item per failed constraint, nested DTOs included, the field as a dotted path (`exercises.0.name`). A decorator
 * without `validationError(...)` gives its class-validator text under the generic code.
 */
function toErrorItems(errors: ValidationError[], parentPath = ''): ErrorItemResponse.Dto[] {
  return errors.flatMap(error => {
    const field = parentPath ? `${parentPath}.${error.property}` : error.property;
    const own = Object.entries(error.constraints ?? {}).map(([constraint, message]) => {
      const context: unknown = error.contexts?.[constraint];
      return isValidationErrorContext(context)
        ? new ErrorItemResponse.Dto(context.code, context.params, field)
        : new ErrorItemResponse.Dto('BAD_REQUEST', {}, field, message);
    });
    return [...own, ...toErrorItems(error.children ?? [], field)];
  });
}
