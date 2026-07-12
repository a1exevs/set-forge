import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export namespace GetWorkoutHistoryQuery {
  export class Dto {
    @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 50, default: 20, description: 'Page size' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    readonly limit?: number;

    @ApiPropertyOptional({ example: 0, minimum: 0, default: 0, description: 'Number of items to skip' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    readonly offset?: number;
  }

  export namespace Swagger {
    export class GetWorkoutHistoryQueryDto extends Dto {}
  }
}
