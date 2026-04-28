import { Controller, Get, Post, Body, UseGuards, Param, Put, Req, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UsersService } from '@users/users.service';
import { User } from '@users/users.model';
import { JwtAuthGuard, RolesGuard, RefreshTokenGuard } from '@common/guards';
import { AuthRoles } from '@common/decorators';
import { AddRoleRequest, BanUserRequest, SetUserStatusRequest, GetUsersResponse } from '@users/dto';
import { GetUsersQuery } from '@users/queries';
import { Docs, Routes } from '@common/constants';
import { ParsePositiveIntPipe } from '@common/pipes';
import { OperationResultResponse } from '@common/dto';

@ApiTags(Docs.ru.USERS_CONTROLLER)
@Controller(Routes.ENDPOINT_USERS)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: Docs.ru.GET_USERS_ENDPOINT })
  @ApiOkResponse({ type: GetUsersResponse.Swagger.GetUsersResponseData })
  @ApiBadRequestResponse({ description: Docs.ru.GET_USERS_BAD_REQUcEST })
  @ApiUnauthorizedResponse({ description: Docs.ru.GET_USERS_UNAUTHORIZED })
  @ApiForbiddenResponse({ description: Docs.ru.GET_USERS_FORBIDDEN })
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @Get()
  getUsers(
    @Query() queryParams: GetUsersQuery.Swagger.GetUsersQueryParams,
    @Req() request,
  ): Promise<GetUsersResponse.Data> {
    const userId = request.user.id;
    return this.usersService.getUsers(queryParams.page ?? 1, queryParams.count ?? 10, userId);
  }

  @ApiOperation({ summary: Docs.ru.ADD_ROLE_ENDPOINT })
  @ApiBody({ type: AddRoleRequest.Swagger.AddRoleRequestDto })
  @ApiCreatedResponse({ type: User })
  @ApiBadRequestResponse({ description: Docs.ru.ADD_ROLE_BAD_REQUcEST })
  @ApiNotFoundResponse({ description: Docs.ru.ADD_ROLE_NOT_FOUND })
  @ApiForbiddenResponse({ description: Docs.ru.ADD_ROLE_FORBIDDEN })
  @AuthRoles('admin')
  @UseGuards(RolesGuard, RefreshTokenGuard)
  @Post('/role')
  addRole(@Body() dto: AddRoleRequest.Dto) {
    return this.usersService.addRole(dto);
  }

  @ApiOperation({ summary: Docs.ru.BAN_USER_ENDPOINT })
  @ApiBody({ type: BanUserRequest.Swagger.BanUserRequestDto })
  @ApiCreatedResponse({ type: User })
  @ApiNotFoundResponse({ description: Docs.ru.BAN_USER_NOT_FOUND })
  @ApiForbiddenResponse({ description: Docs.ru.BAN_USER_FORBIDDEN })
  @AuthRoles('admin')
  @UseGuards(RolesGuard, RefreshTokenGuard)
  @Post('/ban')
  ban(@Body() dto: BanUserRequest.Dto) {
    return this.usersService.ban(dto);
  }

  @ApiOperation({ summary: Docs.ru.GET_USER_STATUS_ENDPOINT })
  @ApiOkResponse({ type: String })
  @ApiBadRequestResponse({ description: Docs.ru.GET_USER_STATUS_BAD_REQUcEST })
  @ApiNotFoundResponse({ description: Docs.ru.GET_USER_STATUS_NOT_FOUND })
  @ApiUnauthorizedResponse({ description: Docs.ru.GET_USER_STATUS_UNAUTHORIZED })
  @ApiForbiddenResponse({ description: Docs.ru.GET_USER_STATUS_FORBIDDEN })
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @Get('/status/:userId')
  getStatus(@Param('userId', ParsePositiveIntPipe) userId: number): Promise<{ status: string }> {
    return this.usersService.getStatus(userId);
  }

  @ApiOperation({ summary: Docs.ru.SET_USER_STATUS_ENDPOINT })
  @ApiBody({ type: SetUserStatusRequest.Swagger.SetUserStatusRequestDto })
  @ApiOkResponse({ type: OperationResultResponse.Swagger.OperationResultResponseDto })
  @ApiUnauthorizedResponse({ description: Docs.ru.SET_USER_STATUS_UNAUTHORIZED })
  @ApiForbiddenResponse({ description: Docs.ru.SET_USER_STATUS_FORBIDDEN })
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @Put('/status')
  async setStatus(@Req() request, @Body() dto: SetUserStatusRequest.Dto) {
    await this.usersService.setStatus(dto, request.user.id);
    return new OperationResultResponse.Dto({ result: true });
  }
}
