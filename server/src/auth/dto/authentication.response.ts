import { ApiProperty } from '@nestjs/swagger';

export namespace AuthenticationResponse {
  export class Dto {
    @ApiProperty()
    readonly userId: number;

    @ApiProperty()
    readonly accessToken: string;

    constructor(dto: Dto) {
      this.userId = dto.userId;
      this.accessToken = dto.accessToken;
    }
  }

  export namespace Swagger {
    export class AuthenticationResponseDto extends Dto {}
  }
}
