import { ApiProperty } from '@nestjs/swagger';

import { MUSCLE_GROUPS, MuscleGroup } from '@workout-lists/constants/muscle-groups';

export namespace WorkoutListResponse {
  export class ExerciseDto {
    @ApiProperty({ example: 'b7e2d1f4-...' })
    readonly id: string;

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
    @ApiProperty({ example: 'a3f1c0e2-...' })
    readonly id: string;

    @ApiProperty({ example: 'Push Day' })
    readonly name: string;

    @ApiProperty({ example: 'Chest, shoulders, triceps' })
    readonly description: string;

    @ApiProperty({ type: [ExerciseDto] })
    readonly exercises: ExerciseDto[];

    @ApiProperty({ example: '2026-06-03T12:00:00.000Z' })
    readonly createdAt: string;

    @ApiProperty({ example: '2026-06-03T12:00:00.000Z', nullable: true })
    readonly lastUsedAt: string | null;

    constructor(dto: Dto) {
      this.id = dto.id;
      this.name = dto.name;
      this.description = dto.description;
      this.exercises = dto.exercises;
      this.createdAt = dto.createdAt;
      this.lastUsedAt = dto.lastUsedAt;
    }
  }

  export namespace Swagger {
    export class WorkoutListResponseDto extends Dto {}
  }
}
