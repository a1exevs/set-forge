import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

import { ErrorMessages } from '@common/constants';

export namespace BanUserRequest {
  export class Dto {
    @ApiProperty()
    @IsNumber({}, { message: ErrorMessages.ru.MUST_BE_A_NUMBER })
    readonly userId: number;

    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly banReason: string;

    constructor(userId, banReason) {
      this.userId = userId;
      this.banReason = banReason;
    }
  }

  export namespace Swagger {
    export class BanUserRequestDto extends Dto {}
  }
}
