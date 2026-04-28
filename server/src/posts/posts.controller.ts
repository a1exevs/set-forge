import { Body, Controller, Inject, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { REQUEST } from '@nestjs/core';

import { PostsService } from '@posts/posts.service';
import { Post as post } from '@posts/posts.model';
import { CreatePostRequest } from '@posts/dto';
import { JwtAuthGuard, RefreshTokenGuard } from '@common/guards';
import { Routes, Docs } from '@common/constants';
import { ApiBodyWithFile } from '@common/decorators';

@ApiTags(Docs.ru.POSTS_CONTROLLER)
@Controller(Routes.ENDPOINT_POSTS)
export class PostsController {
  constructor(private postsService: PostsService, @Inject(REQUEST) private request) {}

  @ApiOperation({ summary: Docs.ru.CREATE_POST_ENDPOINT })
  @ApiBodyWithFile({ body: CreatePostRequest.Swagger.CreatePostRequestDto, fileFieldName: 'image' })
  @ApiCreatedResponse({ type: post })
  @ApiBadRequestResponse({ description: Docs.ru.CREATE_POST_BAD_REQUEST })
  @ApiUnauthorizedResponse({ description: Docs.ru.CREATE_POST_UNAUTHORIZED })
  @ApiForbiddenResponse({ description: Docs.ru.CREATE_POST_FORBIDDEN })
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @Post()
  create(@Body() dto: CreatePostRequest.Dto, @UploadedFile() image) {
    const userID = this.request.user.id;
    return this.postsService.createPost(dto, image, userID);
  }
}
