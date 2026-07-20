import { ApiProperty } from '@nestjs/swagger';

export namespace GetCurrentUserResponse {
  export class Dto {
    @ApiProperty()
    readonly id: number;

    @ApiProperty()
    readonly email: string;

    @ApiProperty({ description: 'Whether the user must (re-)accept the current legal documents' })
    readonly documentsPendingAcceptance: boolean;

    constructor(props: Dto) {
      this.id = props.id;
      this.email = props.email;
      this.documentsPendingAcceptance = props.documentsPendingAcceptance;
    }
  }

  export namespace Swagger {
    export class GetCurrentUserResponseDto extends Dto {}
  }
}
