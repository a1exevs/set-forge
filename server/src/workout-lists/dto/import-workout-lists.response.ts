import { ApiProperty } from '@nestjs/swagger';

import { WorkoutListResponse } from '@workout-lists/dto/workout-list.response';

export namespace ImportWorkoutListsResponse {
  export class Dto {
    @ApiProperty({ example: 2 })
    readonly importedCount: number;

    @ApiProperty({ type: [WorkoutListResponse.Swagger.WorkoutListResponseDto] })
    readonly lists: WorkoutListResponse.Dto[];

    constructor(dto: Dto) {
      this.importedCount = dto.importedCount;
      this.lists = dto.lists;
    }
  }

  export namespace Swagger {
    export class ImportWorkoutListsResponseDto extends Dto {}
  }
}
