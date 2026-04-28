import { Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Routes, Docs } from '@common/constants';
import { FollowersService } from '@followers/followers.service';
import { JwtAuthGuard, RefreshTokenGuard } from '@common/guards';
import { ParsePositiveIntPipe } from '@common/pipes';
import { OperationResultResponse } from '@common/dto';

@ApiTags(Docs.ru.FOLLOWERS_CONTROLLER)
@Controller(Routes.ENDPOINT_FOLLOWERS)
export class FollowersController {
  constructor(private followersService: FollowersService) {}

  @ApiOperation({ summary: Docs.ru.FOLLOW_ENDPOINT })
  @ApiOkResponse({ type: OperationResultResponse.Swagger.OperationResultResponseDto })
  @ApiBadRequestResponse({ description: Docs.ru.FOLLOW_BAD_REQUEST })
  @ApiNotFoundResponse({ description: Docs.ru.FOLLOW_NOT_FOUND })
  @ApiUnauthorizedResponse({ description: Docs.ru.FOLLOW_UNAUTHORIZED })
  @ApiForbiddenResponse({ description: Docs.ru.FOLLOW_FORBIDDEN })
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @Post('/:userId')
  async follow(@Param('userId', ParsePositiveIntPipe) userId: number, @Req() request) {
    const followerId = request.user.id;
    const result = await this.followersService.follow({ followerId, userId });
    return new OperationResultResponse.Dto({ result });
  }

  @ApiOperation({ summary: Docs.ru.UNFOLLOW_ENDPOINT })
  @ApiResponse({ status: 201, type: OperationResultResponse.Swagger.OperationResultResponseDto })
  @ApiBadRequestResponse({ description: Docs.ru.UNFOLLOW_BAD_REQUEST })
  @ApiNotFoundResponse({ description: Docs.ru.UNFOLLOW_NOT_FOUND })
  @ApiUnauthorizedResponse({ description: Docs.ru.UNFOLLOW_UNAUTHORIZED })
  @ApiForbiddenResponse({ description: Docs.ru.UNFOLLOW_FORBIDDEN })
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @Delete('/:userId')
  async unfollow(@Param('userId', ParsePositiveIntPipe) userId: number, @Req() request) {
    const followerId = request.user.id;
    const result = await this.followersService.unfollow({ followerId, userId });
    return new OperationResultResponse.Dto({ result });
  }
}
