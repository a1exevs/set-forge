import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
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

import { Docs, Routes } from '@common/constants';
import { ApiResult } from '@common/decorators';
import { OperationResultResponse } from '@common/dto';
import { HttpExceptionFilter } from '@common/exception-filters';
import { JwtAuthGuard, RefreshTokenGuard } from '@common/guards';
import { ResponseInterceptor } from '@common/interceptors';
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
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseInterceptor)
@Controller(Routes.ENDPOINT_WORKOUT_LISTS)
export class WorkoutListsController {
  constructor(private workoutListsService: WorkoutListsService) {}

  @ApiOperation({ summary: Docs.GET_WORKOUT_LISTS_ENDPOINT })
  @ApiResult({
    status: 200,
    type: WorkoutListResponse.Swagger.WorkoutListResponseDto,
    description: Docs.GET_WORKOUT_LISTS_SUCCESSFUL_RESULT,
  })
  @ApiUnauthorizedResponse({ description: Docs.GET_WORKOUT_LISTS_UNAUTHORIZED })
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
  @ApiUnauthorizedResponse({ description: Docs.EXPORT_ALL_WORKOUT_LISTS_UNAUTHORIZED })
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
  @ApiBadRequestResponse({ description: Docs.IMPORT_WORKOUT_LISTS_BAD_REQUEST })
  @ApiUnauthorizedResponse({ description: Docs.IMPORT_WORKOUT_LISTS_UNAUTHORIZED })
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
  @ApiNotFoundResponse({ description: Docs.GET_WORKOUT_LIST_NOT_FOUND })
  @ApiUnauthorizedResponse({ description: Docs.GET_WORKOUT_LIST_UNAUTHORIZED })
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
  @ApiBadRequestResponse({ description: Docs.CREATE_WORKOUT_LIST_BAD_REQUEST })
  @ApiUnauthorizedResponse({ description: Docs.CREATE_WORKOUT_LIST_UNAUTHORIZED })
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
  @ApiBadRequestResponse({ description: Docs.UPDATE_WORKOUT_LIST_BAD_REQUEST })
  @ApiNotFoundResponse({ description: Docs.UPDATE_WORKOUT_LIST_NOT_FOUND })
  @ApiUnauthorizedResponse({ description: Docs.UPDATE_WORKOUT_LIST_UNAUTHORIZED })
  @Put('/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkoutListRequest.Dto,
    @Req() request,
  ): Promise<WorkoutListResponse.Dto> {
    return this.workoutListsService.update(request.user.id, id, dto);
  }

  @ApiOperation({ summary: Docs.DELETE_WORKOUT_LIST_ENDPOINT })
  @ApiOkResponse({
    type: OperationResultResponse.Swagger.OperationResultResponseDto,
    description: Docs.DELETE_WORKOUT_LIST_SUCCESSFUL_RESULT,
  })
  @ApiNotFoundResponse({ description: Docs.DELETE_WORKOUT_LIST_NOT_FOUND })
  @ApiUnauthorizedResponse({ description: Docs.DELETE_WORKOUT_LIST_UNAUTHORIZED })
  @Delete('/:id')
  async remove(@Param('id') id: string, @Req() request): Promise<OperationResultResponse.Dto> {
    const result = await this.workoutListsService.remove(request.user.id, id);
    return new OperationResultResponse.Dto(result);
  }
}
