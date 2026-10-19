import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { validationError } from '@common/utils';

export namespace GetWorkoutHistoryQuery {
  export class Dto {
    @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 50, default: 20, description: 'Page size' })
    @IsOptional()
    @Type(() => Number)
    @IsInt(validationError('MUST_BE_AN_INTEGER_NUMBER'))
    @Min(1, validationError('NUMERIC_MUST_NOT_BE_LESS_THAN_N', { min: 1 }))
    @Max(50, validationError('NUMERIC_MUST_NOT_BE_GREATER_THAN_N', { max: 50 }))
    readonly limit?: number;

    @ApiPropertyOptional({ example: 0, minimum: 0, default: 0, description: 'Number of items to skip' })
    @IsOptional()
    @Type(() => Number)
    @IsInt(validationError('MUST_BE_AN_INTEGER_NUMBER'))
    @Min(0, validationError('NUMERIC_MUST_NOT_BE_LESS_THAN_N', { min: 0 }))
    readonly offset?: number;
  }

  export namespace Swagger {
    export class GetWorkoutHistoryQueryDto extends Dto {}
  }
}
