import { ApiProperty } from '@nestjs/swagger';

export namespace GetUserContactResponse {
  export class Dto {
    @ApiProperty()
    readonly facebook: string = '';

    @ApiProperty()
    readonly website: string = '';

    @ApiProperty()
    readonly twitter: string = '';

    @ApiProperty()
    readonly instagram: string = '';

    @ApiProperty()
    readonly youtube: string = '';

    @ApiProperty()
    readonly github: string = '';

    @ApiProperty()
    vk = '';

    @ApiProperty()
    mainLink = '';

    constructor(dto: Partial<Dto>) {
      if (dto) {
        this.facebook = dto.facebook ?? this.facebook;
        this.website = dto.website ?? this.website;
        this.twitter = dto.twitter ?? this.twitter;
        this.instagram = dto.instagram ?? this.instagram;
        this.youtube = dto.youtube ?? this.youtube;
        this.github = dto.github ?? this.github;
        this.vk = dto.vk ?? this.vk;
        this.mainLink = dto.mainLink ?? this.mainLink;
      }
    }
  }

  export namespace Swagger {
    export class GetUserContactResponseDto extends Dto {}
  }
}
