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

import { ErrorMessages } from '@common/constants';
import { MUSCLE_GROUPS, MuscleGroup } from '@workout-lists/constants/muscle-groups';

export const WORKOUT_LISTS_EXPORT_FORMAT_VERSION = 1;
export const WORKOUT_LISTS_EXPORT_APP = 'set-forge';

export namespace WorkoutListsExportFile {
  export class ExerciseDto {
    @ApiProperty({ example: 'Bench Press' })
    @IsString({ message: ErrorMessages.MUST_BE_A_STRING })
    readonly name: string;

    @ApiProperty({ enum: MUSCLE_GROUPS, example: 'chest' })
    @IsIn(MUSCLE_GROUPS as unknown as string[])
    readonly muscleGroup: MuscleGroup;

    @ApiProperty({ example: 60 })
    @IsNumber({}, { message: ErrorMessages.MUST_BE_A_NUMBER })
    @Min(0, { message: ErrorMessages.NUMERIC_MUST_NOT_BE_LESS_THAN_N.format(0) })
    readonly weight: number;

    @ApiProperty({ example: 10 })
    @IsInt({ message: ErrorMessages.MUST_BE_AN_INTEGER_NUMBER })
    @Min(1, { message: ErrorMessages.NUMERIC_MUST_NOT_BE_LESS_THAN_N.format(1) })
    readonly reps: number;

    @ApiProperty({ example: 3 })
    @IsInt({ message: ErrorMessages.MUST_BE_AN_INTEGER_NUMBER })
    @Min(1, { message: ErrorMessages.NUMERIC_MUST_NOT_BE_LESS_THAN_N.format(1) })
    readonly sets: number;
  }

  export class ListItemDto {
    @ApiProperty({ example: 'Push Day' })
    @IsString({ message: ErrorMessages.MUST_BE_A_STRING })
    readonly name: string;

    @ApiProperty({ example: 'Chest, shoulders, triceps' })
    @IsString({ message: ErrorMessages.MUST_BE_A_STRING })
    readonly description: string;

    @ApiProperty({ type: [ExerciseDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ExerciseDto)
    readonly exercises: ExerciseDto[];

    @ApiProperty({ required: false, example: '2026-06-03T12:00:00.000Z' })
    @IsOptional()
    @IsString({ message: ErrorMessages.MUST_BE_A_STRING })
    readonly createdAt?: string;

    @ApiProperty({ required: false, example: null, nullable: true })
    @IsOptional()
    readonly lastUsedAt?: string | null;
  }

  export class Dto {
    @ApiProperty({ example: WORKOUT_LISTS_EXPORT_FORMAT_VERSION })
    @IsInt({ message: ErrorMessages.MUST_BE_AN_INTEGER_NUMBER })
    readonly formatVersion: number;

    @ApiProperty({ example: WORKOUT_LISTS_EXPORT_APP })
    @IsIn([WORKOUT_LISTS_EXPORT_APP])
    readonly app: typeof WORKOUT_LISTS_EXPORT_APP;

    @ApiProperty({ example: '2026-06-03T12:00:00.000Z' })
    @IsString({ message: ErrorMessages.MUST_BE_A_STRING })
    readonly exportedAt: string;

    @ApiProperty({ type: [ListItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ListItemDto)
    readonly workoutLists: ListItemDto[];
  }

  export namespace Swagger {
    export class WorkoutListsExportFileDto extends Dto {}
  }
}
