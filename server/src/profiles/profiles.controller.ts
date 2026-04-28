import {
  Controller,
  Get,
  UseGuards,
  Put,
  Param,
  ParseIntPipe,
  Req,
  Body,
  UseInterceptors,
  UploadedFile,
  UseFilters,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard, RefreshTokenGuard } from '@common/guards';
import { ProfilesService } from '@profiles/profiles.service';
import { GetProfileResponse, SetProfileRequest } from '@profiles/dto';
import { CommonResponse } from '@common/dto';
import { HttpExceptionFilter } from '@common/exception-filters';
import { ResponseInterceptor } from '@common/interceptors';
import { Routes, Docs } from '@common/constants';
import { ApiBodyWithFile } from '@common/decorators';

@ApiTags(Docs.ru.PROFILES_CONTROLLER)
@Controller(Routes.ENDPOINT_PROFILES)
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @ApiOperation({ summary: Docs.ru.GET_PROFILE_ENDPOINT })
  @ApiOkResponse({ type: GetProfileResponse.Swagger.GetProfileResponseDto })
  @ApiBadRequestResponse({ description: Docs.ru.GET_PROFILE_BAD_REQUcEST })
  @ApiUnauthorizedResponse({ description: Docs.ru.GET_PROFILE_UNAUTHORIZED })
  @ApiForbiddenResponse({ description: Docs.ru.GET_PROFILE_FORBIDDEN })
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @Get('/:userId')
  getProfile(@Param('userId', ParseIntPipe) userId: number) {
    return this.profilesService.getUserProfile(userId);
  }

  @ApiOperation({ summary: Docs.ru.SET_PROFILE_ENDPOINT })
  @ApiBody({ type: SetProfileRequest.Swagger.SetProfileRequestDto })
  @ApiOkResponse({ type: GetProfileResponse.Swagger.GetProfileResponseDto })
  @ApiBadRequestResponse({ description: Docs.ru.SET_PROFILE_BAD_REQUcEST })
  @ApiUnauthorizedResponse({ description: Docs.ru.SET_PROFILE_UNAUTHORIZED })
  @ApiForbiddenResponse({ description: Docs.ru.SET_PROFILE_FORBIDDEN })
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @Put()
  setProfile(@Body() dto: SetProfileRequest.Dto, @Req() request) {
    const userId = request.user.id;
    return this.profilesService.setUserProfile(userId, dto);
  }

  @ApiOperation({ summary: Docs.ru.SET_PROFILE_PHOTO_ENDPOINT })
  @ApiBodyWithFile({ fileFieldName: 'image' })
  @ApiOkResponse({ type: CommonResponse.Swagger.CommonResponseDto })
  @ApiBadRequestResponse({ description: Docs.ru.SET_PROFILE_PHOTO_BAD_REQUcEST })
  @ApiUnauthorizedResponse({ description: Docs.ru.SET_PROFILE_PHOTO_UNAUTHORIZED })
  @ApiForbiddenResponse({ description: Docs.ru.SET_PROFILE_PHOTO_FORBIDDEN })
  @UseFilters(HttpExceptionFilter)
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @UseInterceptors(FileInterceptor('image'), ResponseInterceptor)
  @Put('/photo')
  setProfilePhoto(@UploadedFile() image, @Req() request) {
    const userId = request.user.id;
    return this.profilesService.setUserProfilePhoto(image, userId);
  }
}
