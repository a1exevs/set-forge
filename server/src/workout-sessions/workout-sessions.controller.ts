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
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';

import { JwtAuthGuard, RefreshTokenGuard } from '@common/guards';
import { ResponseInterceptor } from '@common/interceptors';
import { HttpExceptionFilter } from '@common/exception-filters';
import { Routes, Docs } from '@common/constants';
import { ApiResult } from '@common/decorators';
import { OperationResultResponse } from '@common/dto';
import { WorkoutSessionsService } from '@workout-sessions/workout-sessions.service';
import {
  GetActiveWorkoutSessionQuery,
  GetWorkoutHistoryQuery,
  StartWorkoutSessionRequest,
  WorkoutHistoryResponse,
  WorkoutSessionResponse,
} from '@workout-sessions/dto';

@ApiTags(Docs.WORKOUT_SESSIONS_CONTROLLER)
@UseGuards(JwtAuthGuard, RefreshTokenGuard)
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseInterceptor)
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
  @ApiBadRequestResponse({ description: Docs.START_WORKOUT_SESSION_BAD_REQUEST })
  @ApiNotFoundResponse({ description: Docs.START_WORKOUT_SESSION_NOT_FOUND })
  @ApiUnauthorizedResponse({ description: Docs.START_WORKOUT_SESSION_UNAUTHORIZED })
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
  @ApiBadRequestResponse({ description: Docs.GET_WORKOUT_HISTORY_BAD_REQUEST })
  @ApiUnauthorizedResponse({ description: Docs.GET_WORKOUT_HISTORY_UNAUTHORIZED })
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
  @ApiBadRequestResponse({ description: Docs.GET_ACTIVE_WORKOUT_SESSION_BAD_REQUEST })
  @ApiUnauthorizedResponse({ description: Docs.GET_ACTIVE_WORKOUT_SESSION_UNAUTHORIZED })
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
  @ApiBadRequestResponse({ description: Docs.UPDATE_WORKOUT_SESSION_PROGRESS_BAD_REQUEST })
  @ApiNotFoundResponse({ description: Docs.UPDATE_WORKOUT_SESSION_PROGRESS_NOT_FOUND })
  @ApiUnauthorizedResponse({ description: Docs.UPDATE_WORKOUT_SESSION_PROGRESS_UNAUTHORIZED })
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
  @ApiNotFoundResponse({ description: Docs.FINISH_WORKOUT_SESSION_NOT_FOUND })
  @ApiUnauthorizedResponse({ description: Docs.FINISH_WORKOUT_SESSION_UNAUTHORIZED })
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
  @ApiBadRequestResponse({ description: Docs.RESYNC_WORKOUT_SESSION_BAD_REQUEST })
  @ApiNotFoundResponse({ description: Docs.RESYNC_WORKOUT_SESSION_NOT_FOUND })
  @ApiUnauthorizedResponse({ description: Docs.RESYNC_WORKOUT_SESSION_UNAUTHORIZED })
  @Post('/:id/resync')
  resync(@Param('id') id: string, @Req() request): Promise<WorkoutSessionResponse.Dto> {
    return this.workoutSessionsService.resync(request.user.id, id);
  }

  @ApiOperation({ summary: Docs.DISCARD_WORKOUT_SESSION_ENDPOINT })
  @ApiOkResponse({
    type: OperationResultResponse.Swagger.OperationResultResponseDto,
    description: Docs.DISCARD_WORKOUT_SESSION_SUCCESSFUL_RESULT,
  })
  @ApiBadRequestResponse({ description: Docs.DISCARD_WORKOUT_SESSION_BAD_REQUEST })
  @ApiNotFoundResponse({ description: Docs.DISCARD_WORKOUT_SESSION_NOT_FOUND })
  @ApiUnauthorizedResponse({ description: Docs.DISCARD_WORKOUT_SESSION_UNAUTHORIZED })
  @Delete('/:id')
  async discard(@Param('id') id: string, @Req() request): Promise<OperationResultResponse.Dto> {
    const result = await this.workoutSessionsService.discard(request.user.id, id);
    return new OperationResultResponse.Dto(result);
  }
}
