import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { RolesService } from '@roles/roles.service';
import { Role } from '@roles/roles.model';
import { CreateRoleRequest } from '@roles/dto';
import { AuthRoles } from '@common/decorators';
import { RolesGuard, RefreshTokenGuard } from '@common/guards';
import { Routes, Docs } from '@common/constants';

@ApiTags(Docs.ru.ROLES_CONTROLLER)
@Controller(Routes.ENDPOINT_ROLES)
export class RolesController {
  constructor(private roleService: RolesService) {}

  @ApiOperation({ summary: Docs.ru.CREATE_ROLE_ENDPOINT })
  @ApiCreatedResponse({ type: Role })
  @ApiBadRequestResponse({ description: Docs.ru.CREATE_POST_BAD_REQUEST })
  @ApiForbiddenResponse({ description: Docs.ru.CREATE_ROLE_FORBIDDEN })
  @AuthRoles('admin')
  @UseGuards(RolesGuard, RefreshTokenGuard)
  @Post()
  create(@Body() dto: CreateRoleRequest.Dto): Promise<Role> {
    return this.roleService.createRole(dto);
  }

  @ApiOperation({ summary: Docs.ru.GET_ROLE_ENDPOINT })
  @ApiOkResponse({ type: Role })
  @ApiForbiddenResponse({ description: Docs.ru.GET_ROLE_FORBIDDEN })
  @AuthRoles('admin')
  @UseGuards(RolesGuard, RefreshTokenGuard)
  @Get('/:value')
  getByValue(@Param('value') value: string): Promise<Role> {
    return this.roleService.getRoleByValue(value);
  }
}
