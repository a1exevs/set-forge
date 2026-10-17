import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { validationError } from '@common/utils';

export namespace CreateRoleRequest {
  export class Dto {
    @ApiProperty()
    @IsString(validationError('MUST_BE_A_STRING'))
    readonly value: string;

    @ApiProperty()
    @IsString(validationError('MUST_BE_A_STRING'))
    readonly description: string;

    constructor(value, description) {
      this.value = value;
      this.description = description;
    }
  }
}
