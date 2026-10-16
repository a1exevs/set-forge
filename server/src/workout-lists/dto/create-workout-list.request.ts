import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsInt, IsNumber, IsString, Min, ValidateNested } from 'class-validator';

import { validationError } from '@common/utils';
import { MUSCLE_GROUPS, MuscleGroup } from '@workout-lists/constants/muscle-groups';

export namespace CreateWorkoutListRequest {
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

  export class Dto {
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
  }

  export namespace Swagger {
    export class CreateWorkoutListRequestDto extends Dto {}
  }
}
