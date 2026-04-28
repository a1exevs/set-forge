import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

import { ErrorMessages } from '@common/constants';

export namespace SetUserStatusRequest {
  export class Dto {
    private static readonly maxStatusTextLength = 30;

    @ApiProperty({ example: 'Status', description: 'Статус пользователя' })
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    @Length(0, Dto.maxStatusTextLength, {
      message: ErrorMessages.ru.STRING_LENGTH_MUST_NOT_BE_GREATER_THAN_N.format(Dto.maxStatusTextLength),
    })
    readonly status: string;

    constructor(status) {
      this.status = status;
    }
  }

  export namespace Swagger {
    export class SetUserStatusRequestDto extends Dto {}
  }
}
