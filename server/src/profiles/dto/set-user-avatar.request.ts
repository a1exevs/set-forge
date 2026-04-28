import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { ErrorMessages } from '@common/constants';

export namespace SetUserAvatarRequest {
  export class Dto {
    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly small: string = '';

    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly large: string = '';

    constructor(small, large) {
      this.small = small;
      this.large = large;
    }
  }
}
