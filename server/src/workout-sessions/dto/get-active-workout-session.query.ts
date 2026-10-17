import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

import { validationError } from '@common/utils';

export namespace GetActiveWorkoutSessionQuery {
  export class Dto {
    @ApiProperty({ example: 'a3f1c0e2-...', description: 'Workout list to look up the active session for' })
    @IsUUID(undefined, validationError('MUST_BE_A_UUID'))
    readonly workoutListId: string;
  }

  export namespace Swagger {
    export class GetActiveWorkoutSessionQueryDto extends Dto {}
  }
}
