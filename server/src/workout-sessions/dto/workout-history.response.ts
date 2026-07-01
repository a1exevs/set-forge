import { ApiProperty } from '@nestjs/swagger';

import { WorkoutSessionResponse } from '@workout-sessions/dto/workout-session.response';

export namespace WorkoutHistoryResponse {
  export class Dto {
    @ApiProperty({ type: [WorkoutSessionResponse.Dto] })
    readonly items: WorkoutSessionResponse.Dto[];

    @ApiProperty({ example: 42, description: 'Total number of completed sessions for the user' })
    readonly total: number;

    @ApiProperty({ example: true, description: 'Whether more items exist beyond this page' })
    readonly hasMore: boolean;

    constructor(dto: Dto) {
      this.items = dto.items;
      this.total = dto.total;
      this.hasMore = dto.hasMore;
    }
  }

  export namespace Swagger {
    export class WorkoutHistoryResponseDto extends Dto {}
  }
}
