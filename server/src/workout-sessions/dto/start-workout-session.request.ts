import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export namespace StartWorkoutSessionRequest {
  export class Dto {
    @ApiProperty({ example: 'a3f1c0e2-...', description: 'Workout list to start a session from' })
    @IsUUID()
    readonly workoutListId: string;
  }

  export namespace Swagger {
    export class StartWorkoutSessionRequestDto extends Dto {}
  }
}
