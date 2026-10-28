import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ErrorCode, ErrorMessages, ErrorParams } from '@common/constants/error-messages';
import { formatMessage } from '@common/utils/formatters.util';

export namespace ErrorItemResponse {
  export class Dto {
    @ApiProperty({ enum: Object.keys(ErrorMessages), example: 'NUMERIC_MUST_NOT_BE_LESS_THAN_N' })
    readonly code: ErrorCode;

    @ApiProperty({
      type: 'object',
      additionalProperties: { oneOf: [{ type: 'string' }, { type: 'number' }] },
      example: { min: 1 },
      description: 'Values for the named placeholders of the text',
    })
    readonly params: ErrorParams;

    @ApiPropertyOptional({
      example: 'exercises.0.sets',
      description: 'The request field, a dotted path for nested ones; absent when the error has no field',
    })
    readonly field?: string;

    @ApiProperty({ example: 'Must not be less than 1', description: 'The English text, for logs and API docs' })
    readonly message: string;

    /** `message` is built from the catalogue unless given — a Nest exception keeps its own text. */
    constructor(code: ErrorCode, params: ErrorParams = {}, field?: string, message?: string) {
      this.code = code;
      this.params = params;
      if (field !== undefined) {
        this.field = field;
      }
      this.message = message ?? formatMessage(ErrorMessages[code], params);
    }
  }

  export namespace Swagger {
    export class ErrorItemResponseDto extends Dto {}
  }
}
