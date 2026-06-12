import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

import { ValidationException } from '@common/exceptions';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata): Promise<any> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const obj = plainToInstance(metatype, value);

    const errors = await validate(obj);

    if (errors.length) {
      const messages = this.getErrorsMessages(errors);

      throw new ValidationException(messages);
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private getErrorsMessages(errors: ValidationError[]) {
    return errors.map(error => {
      const message = error.constraints ? `${error.property} - ${Object.values(error.constraints).join(', ')}` : '';
      let childrenMessages;
      if (error.children) childrenMessages = this.getErrorsMessages(error.children);
      if (message && childrenMessages && childrenMessages.length) childrenMessages.push(message);
      if (childrenMessages && childrenMessages.length) return childrenMessages;
      return message;
    });
  }
}
