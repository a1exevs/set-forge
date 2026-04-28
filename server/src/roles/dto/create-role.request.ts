import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { ErrorMessages } from '@common/constants';

export namespace CreateRoleRequest {
  export class Dto {
    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly value: string;

    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly description: string;

    constructor(value, description) {
      this.value = value;
      this.description = description;
    }
  }
}
