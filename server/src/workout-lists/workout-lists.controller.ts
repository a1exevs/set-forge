import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Docs, Routes } from '@common/constants';
import { ApiErrorCases, ApiErrorResult, ApiResult } from '@common/decorators';
import { OperationResultResponse } from '@common/dto';
import { JwtAuthGuard, RefreshTokenGuard } from '@common/guards';
import { MUSCLE_GROUPS } from '@workout-lists/constants/muscle-groups';
import {
  CreateWorkoutListRequest,
  ImportWorkoutListsRequest,
  ImportWorkoutListsResponse,
  UpdateWorkoutListRequest,
  WorkoutListResponse,
  WorkoutListsExportFileResponse,
} from '@workout-lists/dto';
import { WorkoutListsService } from '@workout-lists/workout-lists.service';

@ApiTags(Docs.WORKOUT_LISTS_CONTROLLER)
@UseGuards(JwtAuthGuard, RefreshTokenGuard)
@Controller(Routes.ENDPOINT_WORKOUT_LISTS)
export class WorkoutListsController {
  constructor(private workoutListsService: WorkoutListsService) {}

  @ApiOperation({ summary: Docs.GET_WORKOUT_LISTS_ENDPOINT })
  @ApiResult({
    status: 200,
    type: WorkoutListResponse.Swagger.WorkoutListResponseDto,
    description: Docs.GET_WORKOUT_LISTS_SUCCESSFUL_RESULT,
  })
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.GET_WORKOUT_LISTS_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @Get()
  getAll(@Req() request): Promise<WorkoutListResponse.Dto[]> {
    return this.workoutListsService.getAll(request.user.id);
  }

  @ApiOperation({ summary: Docs.EXPORT_ALL_WORKOUT_LISTS_ENDPOINT })
  @ApiResult({
    status: 200,
    type: WorkoutListsExportFileResponse.Swagger.WorkoutListsExportFileResponseDto,
    description: Docs.EXPORT_ALL_WORKOUT_LISTS_SUCCESSFUL_RESULT,
  })
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.EXPORT_ALL_WORKOUT_LISTS_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @Get('export')
  exportAll(@Req() request): Promise<WorkoutListsExportFileResponse.Dto> {
    return this.workoutListsService.exportAll(request.user.id);
  }

  @ApiOperation({ summary: Docs.IMPORT_WORKOUT_LISTS_ENDPOINT })
  @ApiBody({ type: ImportWorkoutListsRequest.Swagger.ImportWorkoutListsRequestDto })
  @ApiResult({
    status: 201,
    type: ImportWorkoutListsResponse.Swagger.ImportWorkoutListsResponseDto,
    description: Docs.IMPORT_WORKOUT_LISTS_SUCCESSFUL_RESULT,
  })
  @ApiErrorResult({
    status: HttpStatus.BAD_REQUEST,
    description: Docs.IMPORT_WORKOUT_LISTS_BAD_REQUEST,
    cases: {
      invalidFormat: [{ code: 'INVALID_IMPORT_FILE_FORMAT' }],
      unsupportedVersion: [{ code: 'UNSUPPORTED_EXPORT_FILE_VERSION' }],
    },
  })
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.IMPORT_WORKOUT_LISTS_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @Post('import')
  importAll(@Body() body: unknown, @Req() request): Promise<ImportWorkoutListsResponse.Dto> {
    return this.workoutListsService.importAll(request.user.id, body);
  }

  @ApiOperation({ summary: Docs.GET_WORKOUT_LIST_ENDPOINT })
  @ApiResult({
    status: 200,
    type: WorkoutListResponse.Swagger.WorkoutListResponseDto,
    description: Docs.GET_WORKOUT_LIST_SUCCESSFUL_RESULT,
  })
  @ApiErrorResult({
    status: HttpStatus.NOT_FOUND,
    description: Docs.GET_WORKOUT_LIST_NOT_FOUND,
    cases: ApiErrorCases.NOT_FOUND,
  })
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.GET_WORKOUT_LIST_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @Get('/:id')
  getOne(@Param('id') id: string, @Req() request): Promise<WorkoutListResponse.Dto> {
    return this.workoutListsService.getOne(request.user.id, id);
  }

  @ApiOperation({ summary: Docs.CREATE_WORKOUT_LIST_ENDPOINT })
  @ApiBody({ type: CreateWorkoutListRequest.Swagger.CreateWorkoutListRequestDto })
  @ApiResult({
    status: 201,
    type: WorkoutListResponse.Swagger.WorkoutListResponseDto,
    description: Docs.CREATE_WORKOUT_LIST_SUCCESSFUL_RESULT,
  })
  @ApiErrorResult({
    status: HttpStatus.BAD_REQUEST,
    description: Docs.CREATE_WORKOUT_LIST_BAD_REQUEST,
    cases: {
      emptyExercises: [{ code: 'ARRAY_MUST_NOT_BE_SHORTER_THAN_N', params: { min: 1 }, field: 'exercises' }],
      invalidExercise: [
        { code: 'MUST_BE_A_STRING', field: 'exercises.0.name' },
        { code: 'MUST_BE_ONE_OF', params: { values: MUSCLE_GROUPS.join(', ') }, field: 'exercises.0.muscleGroup' },
        { code: 'NUMERIC_MUST_NOT_BE_LESS_THAN_N', params: { min: 1 }, field: 'exercises.0.sets' },
      ],
    },
  })
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.CREATE_WORKOUT_LIST_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @Post()
  create(@Body() dto: CreateWorkoutListRequest.Dto, @Req() request): Promise<WorkoutListResponse.Dto> {
    return this.workoutListsService.create(request.user.id, dto);
  }

  @ApiOperation({ summary: Docs.UPDATE_WORKOUT_LIST_ENDPOINT })
  @ApiBody({ type: UpdateWorkoutListRequest.Swagger.UpdateWorkoutListRequestDto })
  @ApiResult({
    status: 200,
    type: WorkoutListResponse.Swagger.WorkoutListResponseDto,
    description: Docs.UPDATE_WORKOUT_LIST_SUCCESSFUL_RESULT,
  })
  @ApiErrorResult({
    status: HttpStatus.BAD_REQUEST,
    description: Docs.UPDATE_WORKOUT_LIST_BAD_REQUEST,
    cases: {
      emptyExercises: [{ code: 'ARRAY_MUST_NOT_BE_SHORTER_THAN_N', params: { min: 1 }, field: 'exercises' }],
      invalidExercise: [
        { code: 'MUST_BE_A_STRING', field: 'exercises.0.name' },
        { code: 'MUST_BE_ONE_OF', params: { values: MUSCLE_GROUPS.join(', ') }, field: 'exercises.0.muscleGroup' },
        { code: 'NUMERIC_MUST_NOT_BE_LESS_THAN_N', params: { min: 1 }, field: 'exercises.0.sets' },
      ],
    },
  })
  @ApiErrorResult({
    status: HttpStatus.NOT_FOUND,
    description: Docs.UPDATE_WORKOUT_LIST_NOT_FOUND,
    cases: ApiErrorCases.NOT_FOUND,
  })
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.UPDATE_WORKOUT_LIST_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @Put('/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkoutListRequest.Dto,
    @Req() request,
  ): Promise<WorkoutListResponse.Dto> {
    return this.workoutListsService.update(request.user.id, id, dto);
  }

  @ApiOperation({ summary: Docs.DELETE_WORKOUT_LIST_ENDPOINT })
  @ApiResult({
    status: 200,
    type: OperationResultResponse.Swagger.OperationResultResponseDto,
    description: Docs.DELETE_WORKOUT_LIST_SUCCESSFUL_RESULT,
  })
  @ApiErrorResult({
    status: HttpStatus.NOT_FOUND,
    description: Docs.DELETE_WORKOUT_LIST_NOT_FOUND,
    cases: ApiErrorCases.NOT_FOUND,
  })
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.DELETE_WORKOUT_LIST_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @Delete('/:id')
  async remove(@Param('id') id: string, @Req() request): Promise<OperationResultResponse.Dto> {
    const result = await this.workoutListsService.remove(request.user.id, id);
    return new OperationResultResponse.Dto(result);
  }
}
