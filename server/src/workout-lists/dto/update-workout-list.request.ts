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
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

import { ErrorMessages } from '@common/constants';
import { MUSCLE_GROUPS, MuscleGroup } from '@workout-lists/constants/muscle-groups';

export namespace UpdateWorkoutListRequest {
  export class ExerciseDto {
    @ApiProperty({ required: false, example: 'b7e2d1f4-...', description: 'Existing exercise id' })
    @IsOptional()
    @IsUUID()
    readonly id?: string;

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

  export class Dto {
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
  }

  export namespace Swagger {
    export class UpdateWorkoutListRequestDto extends Dto {}
  }
}
