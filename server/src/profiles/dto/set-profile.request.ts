import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { SetUserContactRequest } from '@profiles/dto/set-user-contact.request';
import { ErrorMessages } from '@common/constants';

export namespace SetProfileRequest {
  export class Dto {
    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly fullName: string;

    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly aboutMe: string;

    @ApiProperty()
    @IsBoolean({ message: ErrorMessages.ru.MUST_BE_A_BOOLEAN })
    readonly lookingForAJob: boolean;

    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly lookingForAJobDescription: string;

    @ApiProperty()
    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => SetUserContactRequest.Dto)
    readonly contacts?: SetUserContactRequest.Swagger.SetUserContactRequestDto;

    constructor(fullName, aboutMe, lookingForAJob, lookingForAJobDescription, contacts = null) {
      this.fullName = fullName;
      this.aboutMe = aboutMe;
      this.lookingForAJob = lookingForAJob;
      this.lookingForAJobDescription = lookingForAJobDescription;
      this.contacts = contacts;
    }
  }

  export namespace Swagger {
    export class SetProfileRequestDto extends Dto {}
  }
}
