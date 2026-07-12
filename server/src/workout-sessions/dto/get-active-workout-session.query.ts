import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export namespace GetActiveWorkoutSessionQuery {
  export class Dto {
    @ApiProperty({ example: 'a3f1c0e2-...', description: 'Workout list to look up the active session for' })
    @IsUUID()
    readonly workoutListId: string;
  }

  export namespace Swagger {
    export class GetActiveWorkoutSessionQueryDto extends Dto {}
  }
}
