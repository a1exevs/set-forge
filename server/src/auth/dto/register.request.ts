import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsEmail, IsString, Length } from 'class-validator';

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

    // Two separate, specific acts of will (152-ФЗ requires PD-processing consent to be a distinct
    // expression, not bundled with acceptance of other documents). Both must be `true`.
    // No constructor default: `plainToInstance` runs this constructor with no args, so a request that
    // omits a flag leaves it `undefined` and is rejected. Validated at the boundary only; not persisted.
    @ApiProperty({ description: 'Consent to the processing of personal data', example: true })
    @Equals(true, { message: ErrorMessages.CONSENT_TO_PERSONAL_DATA_PROCESSING_IS_REQUIRED })
    readonly consent?: boolean;

    @ApiProperty({ description: 'Acceptance of the Terms of Use', example: true })
    @Equals(true, { message: ErrorMessages.TERMS_ACCEPTANCE_IS_REQUIRED })
    readonly termsAccepted?: boolean;

    constructor(email, password, consent?: boolean, termsAccepted?: boolean) {
      this.email = email;
      this.password = password;
      this.consent = consent;
      this.termsAccepted = termsAccepted;
    }
  }

  export namespace Swagger {
    export class RegisterRequestDto extends Dto {}
  }
}
