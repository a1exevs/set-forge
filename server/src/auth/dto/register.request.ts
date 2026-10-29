import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsEmail, IsString, Length } from 'class-validator';

import { Docs } from '@common/constants/docs';
import { validationError } from '@common/utils';

export namespace RegisterRequest {
  export class Dto {
    private static readonly passMinLength = 8;
    private static readonly passMaxLength = 50;

    @ApiProperty({ format: Docs.EMAIL_FORMAT })
    @IsString(validationError('MUST_BE_A_STRING'))
    @IsEmail({}, validationError('MUST_HAS_EMAIL_FORMAT'))
    readonly email: string;

    @ApiProperty({ minLength: Dto.passMinLength, maxLength: Dto.passMaxLength })
    @IsString(validationError('MUST_BE_A_STRING'))
    @Length(
      Dto.passMinLength,
      Dto.passMaxLength,
      validationError('STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N', {
        min: Dto.passMinLength,
        max: Dto.passMaxLength,
      }),
    )
    readonly password: string;

    // session/separate-consent (152-ФЗ). No constructor default: `plainToInstance` calls it with no args, so an
    // omitted flag stays `undefined` and is rejected.
    @ApiProperty({ description: 'Consent to the processing of personal data', example: true })
    @Equals(true, validationError('CONSENT_TO_PERSONAL_DATA_PROCESSING_IS_REQUIRED'))
    readonly consent?: boolean;

    @ApiProperty({ description: 'Acceptance of the Terms of Use', example: true })
    @Equals(true, validationError('TERMS_ACCEPTANCE_IS_REQUIRED'))
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
