import { ApiProperty } from '@nestjs/swagger';

import { MUSCLE_GROUPS, MuscleGroup } from '@workout-lists/constants/muscle-groups';
import { SESSION_STATUS, SESSION_STATUSES, SessionStatus } from '@workout-sessions/constants/session-status';

export namespace WorkoutSessionResponse {
  export class ExerciseDto {
    @ApiProperty({ example: 'd1f4a7c2-...' })
    readonly id: string;

    @ApiProperty({ example: 'b7e2d1f4-...', nullable: true })
    readonly sourceExerciseId: string | null;

    @ApiProperty({ example: 'Bench Press' })
    readonly name: string;

    @ApiProperty({ enum: MUSCLE_GROUPS, example: 'chest' })
    readonly muscleGroup: MuscleGroup;

    @ApiProperty({ example: 60 })
    readonly weight: number;

    @ApiProperty({ example: 10 })
    readonly reps: number;

    @ApiProperty({ example: 3 })
    readonly sets: number;

    @ApiProperty({ example: 0 })
    readonly completedSets: number;
  }

  export class Dto {
    @ApiProperty({ example: 'c9d4e6f1-...' })
    readonly id: string;

    @ApiProperty({ example: 'a3f1c0e2-...', nullable: true })
    readonly workoutListId: string | null;

    @ApiProperty({ example: 'Push Day' })
    readonly workoutListName: string;

    @ApiProperty({ enum: SESSION_STATUSES, example: SESSION_STATUS.ACTIVE })
    readonly status: SessionStatus;

    @ApiProperty({ example: '2026-06-03T12:00:00.000Z' })
    readonly startedAt: string;

    @ApiProperty({ example: '2026-06-03T13:00:00.000Z', nullable: true })
    readonly finishedAt: string | null;

    @ApiProperty({ type: [ExerciseDto] })
    readonly exercises: ExerciseDto[];

    constructor(dto: Dto) {
      this.id = dto.id;
      this.workoutListId = dto.workoutListId;
      this.workoutListName = dto.workoutListName;
      this.status = dto.status;
      this.startedAt = dto.startedAt;
      this.finishedAt = dto.finishedAt;
      this.exercises = dto.exercises;
    }
  }

  export namespace Swagger {
    export class WorkoutSessionResponseDto extends Dto {}
  }
}
