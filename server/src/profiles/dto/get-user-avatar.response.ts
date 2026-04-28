import { ApiProperty } from '@nestjs/swagger';

export namespace GetUserAvatarResponse {
  export class Dto {
    @ApiProperty()
    readonly small: string = '';

    @ApiProperty()
    readonly large: string = '';

    constructor(dto: Partial<Dto>) {
      if (dto) {
        this.small = dto.small ?? this.small;
        this.large = dto.large ?? this.large;
      }
    }
  }

  export namespace Swagger {
    export class GetUserAvatarResponseDto extends Dto {}
  }
}
