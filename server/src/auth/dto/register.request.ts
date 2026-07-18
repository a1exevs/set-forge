import { Equals, IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { ErrorMessages } from '@common/constants';
import { Docs } from '@common/constants/docs';

export namespace RegisterRequest {
  export class Dto {
    private static readonly passMinLength = 8;
    private static readonly passMaxLength = 50;

    @ApiProperty({ format: Docs.EMAIL_FORMAT })
    @IsString({ message: ErrorMessages.MUST_BE_A_STRING })
    @IsEmail({}, { message: ErrorMessages.MUST_HAS_EMAIL_FORMAT })
    readonly email: string;

    @ApiProperty({ minLength: Dto.passMinLength, maxLength: Dto.passMaxLength })
    @IsString({ message: ErrorMessages.MUST_BE_A_STRING })
    @Length(Dto.passMinLength, Dto.passMaxLength, {
      message: ErrorMessages.STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N.format(
        Dto.passMinLength,
        Dto.passMaxLength,
      ),
    })
    readonly password: string;

    // Explicit consent to the privacy policy (152-ФЗ / GDPR). Must be `true`.
    // No default: `plainToInstance` runs this constructor with no args, so a request that
    // omits `consent` leaves it `undefined` and is rejected. Validated at the boundary only; not persisted.
    @ApiProperty({ description: 'Consent to the privacy policy', example: true })
    @Equals(true, { message: ErrorMessages.CONSENT_TO_PRIVACY_POLICY_IS_REQUIRED })
    readonly consent?: boolean;

    constructor(email, password, consent?: boolean) {
      this.email = email;
      this.password = password;
      this.consent = consent;
    }
  }

  export namespace Swagger {
    export class RegisterRequestDto extends Dto {}
  }
}
