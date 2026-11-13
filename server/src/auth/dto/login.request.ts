import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

import { validationError } from '@common/utils';

export namespace LoginRequest {
  export class Dto {
    @ApiProperty()
    @IsString(validationError('MUST_BE_A_STRING'))
    readonly email: string;

    @ApiProperty()
    @IsString(validationError('MUST_BE_A_STRING'))
    readonly password: string;

    @ApiProperty({ required: false, description: 'The answer to the captcha, once the sign-in demands it' })
    @IsString(validationError('MUST_BE_A_STRING'))
    @IsOptional()
    readonly captcha?: string;

    @ApiProperty({
      required: false,
      example: '0b6d3c2e-6f6a-4c55-9a43-2f6f3b5b1c7e',
      description: 'The id of the captcha the answer is for',
    })
    @IsUUID(undefined, validationError('MUST_BE_A_UUID'))
    @IsOptional()
    readonly captchaId?: string;

    constructor(email, password, captcha = null, captchaId = null) {
      this.email = email;
      this.password = password;
      if (captcha) {
        this.captcha = captcha;
      }
      if (captchaId) {
        this.captchaId = captchaId;
      }
    }
  }

  export namespace Swagger {
    export class LoginRequestDto extends Dto {}
  }
}
