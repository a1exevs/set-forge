import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { validationError } from '@common/utils';
import { MUSCLE_GROUPS, MuscleGroup } from '@workout-lists/constants/muscle-groups';

export const WORKOUT_LISTS_EXPORT_FORMAT_VERSION = 1;
export const WORKOUT_LISTS_EXPORT_APP = 'set-forge';

export namespace WorkoutListsExportFileResponse {
  export class ExerciseDto {
    @ApiProperty({ example: 'Bench Press' })
    @IsString(validationError('MUST_BE_A_STRING'))
    readonly name: string;

    @ApiProperty({ enum: MUSCLE_GROUPS, example: 'chest' })
    @IsIn(MUSCLE_GROUPS as unknown as string[], validationError('MUST_BE_ONE_OF', { values: MUSCLE_GROUPS.join(', ') }))
    readonly muscleGroup: MuscleGroup;

    @ApiProperty({ example: 60 })
    @IsNumber({}, validationError('MUST_BE_A_NUMBER'))
    @Min(0, validationError('NUMERIC_MUST_NOT_BE_LESS_THAN_N', { min: 0 }))
    readonly weight: number;

    @ApiProperty({ example: 10 })
    @IsInt(validationError('MUST_BE_AN_INTEGER_NUMBER'))
    @Min(1, validationError('NUMERIC_MUST_NOT_BE_LESS_THAN_N', { min: 1 }))
    readonly reps: number;

    @ApiProperty({ example: 3 })
    @IsInt(validationError('MUST_BE_AN_INTEGER_NUMBER'))
    @Min(1, validationError('NUMERIC_MUST_NOT_BE_LESS_THAN_N', { min: 1 }))
    readonly sets: number;
  }

  export class ListItemDto {
    @ApiProperty({ example: 'Push Day' })
    @IsString(validationError('MUST_BE_A_STRING'))
    readonly name: string;

    @ApiProperty({ example: 'Chest, shoulders, triceps' })
    @IsString(validationError('MUST_BE_A_STRING'))
    readonly description: string;

    @ApiProperty({ type: [ExerciseDto] })
    @IsArray(validationError('MUST_BE_AN_ARRAY'))
    @ArrayMinSize(1, validationError('ARRAY_MUST_NOT_BE_SHORTER_THAN_N', { min: 1 }))
    @ValidateNested({ each: true })
    @Type(() => ExerciseDto)
    readonly exercises: ExerciseDto[];

    @ApiProperty({ required: false, example: '2026-06-03T12:00:00.000Z' })
    @IsOptional()
    @IsString(validationError('MUST_BE_A_STRING'))
    readonly createdAt?: string;

    @ApiProperty({ required: false, example: null, nullable: true })
    @IsOptional()
    readonly lastUsedAt?: string | null;
  }

  export class Dto {
    @ApiProperty({ example: WORKOUT_LISTS_EXPORT_FORMAT_VERSION })
    @IsInt(validationError('MUST_BE_AN_INTEGER_NUMBER'))
    readonly formatVersion: number;

    @ApiProperty({ example: WORKOUT_LISTS_EXPORT_APP })
    @IsIn([WORKOUT_LISTS_EXPORT_APP], validationError('MUST_BE_ONE_OF', { values: WORKOUT_LISTS_EXPORT_APP }))
    readonly app: typeof WORKOUT_LISTS_EXPORT_APP;

    @ApiProperty({ example: '2026-06-03T12:00:00.000Z' })
    @IsString(validationError('MUST_BE_A_STRING'))
    readonly exportedAt: string;

    @ApiProperty({ type: [ListItemDto] })
    @IsArray(validationError('MUST_BE_AN_ARRAY'))
    @ValidateNested({ each: true })
    @Type(() => ListItemDto)
    readonly workoutLists: ListItemDto[];
  }

  export namespace Swagger {
    export class WorkoutListsExportFileResponseDto extends Dto {}
  }
}
