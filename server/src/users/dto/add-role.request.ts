import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

import { ErrorMessages } from '@common/constants';

export namespace AddRoleRequest {
  export class Dto {
    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly value: string;

    @ApiProperty()
    @IsNumber({}, { message: ErrorMessages.ru.MUST_BE_A_NUMBER })
    readonly userId: number;

    constructor(value, userId) {
      this.value = value;
      this.userId = userId;
    }
  }

  export namespace Swagger {
    export class AddRoleRequestDto extends Dto {}
  }
}
