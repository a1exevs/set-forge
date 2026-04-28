import { ApiProperty } from '@nestjs/swagger';
import { ResultCodes } from '@common/constants';

export namespace CommonResponse {
  export class Dto {
    @ApiProperty()
    readonly data: any = null;

    @ApiProperty()
    readonly messages: string[] = [];

    @ApiProperty()
    readonly fieldsErrors: string[] = [];

    @ApiProperty()
    readonly resultCode: number = ResultCodes.OK;

    constructor(dto: Partial<Dto> = null) {
      if (dto) {
        this.data = dto.data ?? this.data;
        this.messages = dto.messages ?? this.messages;
        this.fieldsErrors = dto.fieldsErrors ?? this.fieldsErrors;
        this.resultCode = dto.resultCode ?? this.resultCode;
      }
    }
  }

  export namespace Swagger {
    export class CommonResponseDto extends Dto {}
  }
}
