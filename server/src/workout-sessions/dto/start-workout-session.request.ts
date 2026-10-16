import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

import { validationError } from '@common/utils';

export namespace StartWorkoutSessionRequest {
  export class Dto {
    @ApiProperty({ example: 'a3f1c0e2-...', description: 'Workout list to start a session from' })
    @IsUUID(undefined, validationError('MUST_BE_A_UUID'))
    readonly workoutListId: string;
  }

  export namespace Swagger {
    export class StartWorkoutSessionRequestDto extends Dto {}
  }
}
