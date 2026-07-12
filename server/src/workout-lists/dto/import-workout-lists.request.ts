import { WorkoutListsExportFileResponse } from '@workout-lists/dto/workout-lists-export-file.response';

export namespace ImportWorkoutListsRequest {
  export class Dto extends WorkoutListsExportFileResponse.Dto {}

  export namespace Swagger {
    export class ImportWorkoutListsRequestDto extends WorkoutListsExportFileResponse.Swagger
      .WorkoutListsExportFileResponseDto {}
  }
}
