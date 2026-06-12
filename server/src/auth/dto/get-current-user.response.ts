import { ApiProperty } from '@nestjs/swagger';

export namespace GetCurrentUserResponse {
  export class Dto {
    @ApiProperty()
    readonly id: number;

    @ApiProperty()
    readonly email: string;

    constructor(props: Dto) {
      this.id = props.id;
      this.email = props.email;
    }
  }

  export namespace Swagger {
    export class GetCurrentUserResponseDto extends Dto {}
  }
}
