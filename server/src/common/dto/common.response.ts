import { ApiProperty } from '@nestjs/swagger';

import { ResultCodes } from '@common/constants';
import { ErrorItemResponse } from '@common/dto/error-item.response';

export namespace CommonResponse {
  export class Dto {
    @ApiProperty({ description: 'The payload; null on an error' })
    readonly data: unknown = null;

    @ApiProperty({ description: 'The English texts of the errors, a field error as "field - text"' })
    readonly messages: string[] = [];

    @ApiProperty({ type: [ErrorItemResponse.Swagger.ErrorItemResponseDto], description: 'The errors by code' })
    readonly fieldsErrors: ErrorItemResponse.Dto[] = [];

    @ApiProperty({ description: '0 OK, 1 an error, 10 the captcha is required' })
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
