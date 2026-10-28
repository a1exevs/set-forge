import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { Docs, Routes } from '@common/constants';
import { ApiErrorCases, ApiErrorResult, ApiResult } from '@common/decorators';
import { OperationResultResponse } from '@common/dto';
import { JwtAuthGuard, RefreshTokenGuard } from '@common/guards';
import {
  GetActiveWorkoutSessionQuery,
  GetWorkoutHistoryQuery,
  StartWorkoutSessionRequest,
  WorkoutHistoryResponse,
  WorkoutSessionResponse,
} from '@workout-sessions/dto';
import { WorkoutSessionsService } from '@workout-sessions/workout-sessions.service';

@ApiTags(Docs.WORKOUT_SESSIONS_CONTROLLER)
@UseGuards(JwtAuthGuard, RefreshTokenGuard)
@Controller(Routes.ENDPOINT_WORKOUT_SESSIONS)
export class WorkoutSessionsController {
  constructor(private workoutSessionsService: WorkoutSessionsService) {}

  @ApiOperation({ summary: Docs.START_WORKOUT_SESSION_ENDPOINT })
  @ApiBody({ type: StartWorkoutSessionRequest.Swagger.StartWorkoutSessionRequestDto })
  @ApiResult({
    status: 200,
    type: WorkoutSessionResponse.Swagger.WorkoutSessionResponseDto,
    description: Docs.START_WORKOUT_SESSION_RESUMED_RESULT,
  })
  @ApiResult({
    status: 201,
    type: WorkoutSessionResponse.Swagger.WorkoutSessionResponseDto,
    description: Docs.START_WORKOUT_SESSION_SUCCESSFUL_RESULT,
  })
  @ApiErrorResult({
    status: HttpStatus.BAD_REQUEST,
    description: Docs.START_WORKOUT_SESSION_BAD_REQUEST,
    cases: {
      notUuid: [{ code: 'MUST_BE_A_UUID', field: 'workoutListId' }],
      emptyList: [{ code: 'BAD_REQUEST' }],
    },
  })
  @ApiErrorResult({
    status: HttpStatus.NOT_FOUND,
    description: Docs.START_WORKOUT_SESSION_NOT_FOUND,
    cases: ApiErrorCases.NOT_FOUND,
  })
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.START_WORKOUT_SESSION_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @Post()
  async start(
    @Body() dto: StartWorkoutSessionRequest.Dto,
    @Req() request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<WorkoutSessionResponse.Dto> {
    const { session, created } = await this.workoutSessionsService.start(request.user.id, dto.workoutListId);
    response.status(created ? HttpStatus.CREATED : HttpStatus.OK);
    return session;
  }

  @ApiOperation({ summary: Docs.GET_WORKOUT_HISTORY_ENDPOINT })
  @ApiResult({
    status: 200,
    type: WorkoutHistoryResponse.Swagger.WorkoutHistoryResponseDto,
    description: Docs.GET_WORKOUT_HISTORY_SUCCESSFUL_RESULT,
  })
  @ApiErrorResult({
    status: HttpStatus.BAD_REQUEST,
    description: Docs.GET_WORKOUT_HISTORY_BAD_REQUEST,
    cases: {
      limitTooLarge: [{ code: 'NUMERIC_MUST_NOT_BE_GREATER_THAN_N', params: { max: 50 }, field: 'limit' }],
      negativeOffset: [{ code: 'NUMERIC_MUST_NOT_BE_LESS_THAN_N', params: { min: 0 }, field: 'offset' }],
    },
  })
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.GET_WORKOUT_HISTORY_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @Get()
  getHistory(@Query() query: GetWorkoutHistoryQuery.Dto, @Req() request): Promise<WorkoutHistoryResponse.Dto> {
    return this.workoutSessionsService.getHistory(request.user.id, query.limit, query.offset);
  }

  @ApiOperation({ summary: Docs.GET_ACTIVE_WORKOUT_SESSION_ENDPOINT })
  @ApiResult({
    status: 200,
    nullable: true,
    type: WorkoutSessionResponse.Swagger.WorkoutSessionResponseDto,
    description: Docs.GET_ACTIVE_WORKOUT_SESSION_SUCCESSFUL_RESULT,
  })
  @ApiErrorResult({
    status: HttpStatus.BAD_REQUEST,
    description: Docs.GET_ACTIVE_WORKOUT_SESSION_BAD_REQUEST,
    cases: { notUuid: [{ code: 'MUST_BE_A_UUID', field: 'workoutListId' }] },
  })
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.GET_ACTIVE_WORKOUT_SESSION_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @Get('active')
  getActive(
    @Query() query: GetActiveWorkoutSessionQuery.Dto,
    @Req() request,
  ): Promise<WorkoutSessionResponse.Dto | null> {
    return this.workoutSessionsService.getActive(request.user.id, query.workoutListId);
  }

  @ApiOperation({ summary: Docs.UPDATE_WORKOUT_SESSION_PROGRESS_ENDPOINT })
  @ApiResult({
    status: 200,
    type: WorkoutSessionResponse.Swagger.WorkoutSessionResponseDto,
    description: Docs.UPDATE_WORKOUT_SESSION_PROGRESS_SUCCESSFUL_RESULT,
  })
  @ApiErrorResult({
    status: HttpStatus.BAD_REQUEST,
    description: Docs.UPDATE_WORKOUT_SESSION_PROGRESS_BAD_REQUEST,
    cases: { notActive: [{ code: 'BAD_REQUEST' }] },
  })
  @ApiErrorResult({
    status: HttpStatus.NOT_FOUND,
    description: Docs.UPDATE_WORKOUT_SESSION_PROGRESS_NOT_FOUND,
    cases: ApiErrorCases.NOT_FOUND,
  })
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.UPDATE_WORKOUT_SESSION_PROGRESS_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @Patch('/:id/exercises/:exerciseId/progress')
  incrementProgress(
    @Param('id') id: string,
    @Param('exerciseId') exerciseId: string,
    @Req() request,
  ): Promise<WorkoutSessionResponse.Dto> {
    return this.workoutSessionsService.incrementProgress(request.user.id, id, exerciseId);
  }

  @ApiOperation({ summary: Docs.FINISH_WORKOUT_SESSION_ENDPOINT })
  @ApiResult({
    status: 201,
    type: WorkoutSessionResponse.Swagger.WorkoutSessionResponseDto,
    description: Docs.FINISH_WORKOUT_SESSION_SUCCESSFUL_RESULT,
  })
  @ApiErrorResult({
    status: HttpStatus.NOT_FOUND,
    description: Docs.FINISH_WORKOUT_SESSION_NOT_FOUND,
    cases: ApiErrorCases.NOT_FOUND,
  })
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.FINISH_WORKOUT_SESSION_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @Post('/:id/finish')
  finish(@Param('id') id: string, @Req() request): Promise<WorkoutSessionResponse.Dto> {
    return this.workoutSessionsService.finish(request.user.id, id);
  }

  @ApiOperation({ summary: Docs.RESYNC_WORKOUT_SESSION_ENDPOINT })
  @ApiResult({
    status: 201,
    type: WorkoutSessionResponse.Swagger.WorkoutSessionResponseDto,
    description: Docs.RESYNC_WORKOUT_SESSION_SUCCESSFUL_RESULT,
  })
  @ApiErrorResult({
    status: HttpStatus.BAD_REQUEST,
    description: Docs.RESYNC_WORKOUT_SESSION_BAD_REQUEST,
    cases: { notActiveOrNoList: [{ code: 'BAD_REQUEST' }] },
  })
  @ApiErrorResult({
    status: HttpStatus.NOT_FOUND,
    description: Docs.RESYNC_WORKOUT_SESSION_NOT_FOUND,
    cases: ApiErrorCases.NOT_FOUND,
  })
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.RESYNC_WORKOUT_SESSION_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @Post('/:id/resync')
  resync(@Param('id') id: string, @Req() request): Promise<WorkoutSessionResponse.Dto> {
    return this.workoutSessionsService.resync(request.user.id, id);
  }

  @ApiOperation({ summary: Docs.DISCARD_WORKOUT_SESSION_ENDPOINT })
  @ApiResult({
    status: 200,
    type: OperationResultResponse.Swagger.OperationResultResponseDto,
    description: Docs.DISCARD_WORKOUT_SESSION_SUCCESSFUL_RESULT,
  })
  @ApiErrorResult({
    status: HttpStatus.BAD_REQUEST,
    description: Docs.DISCARD_WORKOUT_SESSION_BAD_REQUEST,
    cases: { notActive: [{ code: 'BAD_REQUEST' }] },
  })
  @ApiErrorResult({
    status: HttpStatus.NOT_FOUND,
    description: Docs.DISCARD_WORKOUT_SESSION_NOT_FOUND,
    cases: ApiErrorCases.NOT_FOUND,
  })
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.DISCARD_WORKOUT_SESSION_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @Delete('/:id')
  async discard(@Param('id') id: string, @Req() request): Promise<OperationResultResponse.Dto> {
    const result = await this.workoutSessionsService.discard(request.user.id, id);
    return new OperationResultResponse.Dto(result);
  }
}
