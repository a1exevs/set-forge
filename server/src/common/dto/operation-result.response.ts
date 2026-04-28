import { ApiProperty } from '@nestjs/swagger';

export namespace OperationResultResponse {
  export class Dto {
    @ApiProperty()
    readonly result: any;

    constructor(dto: Dto) {
      this.result = dto.result;
    }
  }

  export namespace Swagger {
    export class OperationResultResponseDto extends Dto {}
  }
}
