import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { ErrorMessages } from '@common/constants';
import { Docs } from '@common/constants/docs';

export namespace RegisterRequest {
  export class Dto {
    private static readonly passMinLength = 8;
    private static readonly passMaxLength = 50;

    @ApiProperty({ format: Docs.ru.EMAIL_FORMAT })
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    @IsEmail({}, { message: ErrorMessages.ru.MUST_HAS_EMAIL_FORMAT })
    readonly email: string;

    @ApiProperty({ minLength: Dto.passMinLength, maxLength: Dto.passMaxLength })
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    @Length(Dto.passMinLength, Dto.passMaxLength, {
      message: ErrorMessages.ru.STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N.format(
        Dto.passMinLength,
        Dto.passMaxLength,
      ),
    })
    readonly password: string;

    constructor(email, password) {
      this.email = email;
      this.password = password;
    }
  }

  export namespace Swagger {
    export class RegisterRequestDto extends Dto {}
  }
}
