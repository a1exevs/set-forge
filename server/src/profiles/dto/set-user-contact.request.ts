import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { ErrorMessages } from '@common/constants';

export namespace SetUserContactRequest {
  export class Dto {
    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly facebook: string = '';

    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly website: string = '';

    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly twitter: string = '';

    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly instagram: string = '';

    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly youtube: string = '';

    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly github: string = '';

    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly vk: string = '';

    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly mainLink: string = '';

    constructor(facebook, website, twitter, instagram, youtube, github, vk, mainLink) {
      this.facebook = facebook;
      this.website = website;
      this.twitter = twitter;
      this.instagram = instagram;
      this.youtube = youtube;
      this.github = github;
      this.vk = vk;
      this.mainLink = mainLink;
    }
  }

  export namespace Swagger {
    export class SetUserContactRequestDto extends Dto {}
  }
}
