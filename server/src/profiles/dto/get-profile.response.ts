import { ApiProperty } from '@nestjs/swagger';

import { GetUserContactResponse } from '@profiles/dto/get-user-contact.response';
import { GetUserAvatarResponse } from '@profiles/dto/get-user-avatar.response';

export namespace GetProfileResponse {
  export class Dto {
    @ApiProperty()
    readonly fullName: string = '';

    @ApiProperty()
    readonly aboutMe: string = '';

    @ApiProperty()
    readonly lookingForAJob: boolean = false;

    @ApiProperty()
    readonly lookingForAJobDescription: string = '';

    @ApiProperty()
    readonly contacts: GetUserContactResponse.Swagger.GetUserContactResponseDto = null;

    @ApiProperty()
    readonly photos: GetUserAvatarResponse.Swagger.GetUserAvatarResponseDto = null;

    constructor(commonInfo: Partial<Dto>, contacts: GetUserContactResponse.Dto, photos: GetUserAvatarResponse.Dto) {
      if (commonInfo) {
        this.fullName = commonInfo.fullName ?? this.fullName;
        this.aboutMe = commonInfo.aboutMe ?? this.aboutMe;
        this.lookingForAJob = commonInfo.lookingForAJob ?? this.lookingForAJob;
        this.lookingForAJobDescription = commonInfo.lookingForAJobDescription ?? this.lookingForAJobDescription;
      }
      this.contacts = contacts ?? this.contacts;
      this.photos = photos ?? this.photos;
    }
  }

  export namespace Swagger {
    export class GetProfileResponseDto extends Dto {}
  }
}
