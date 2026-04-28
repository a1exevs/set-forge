import { Body, Controller, Delete, Get, Post, Req, Res, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { AuthService } from '@auth/auth.service';
import { LoginRequest, RegisterRequest, AuthenticationResponse, GetCurrentUserResponse } from '@auth/dto';
import { JwtAuthGuard, RefreshTokenGuard } from '@common/guards';
import { SvgCaptchaGuard } from '@auth/guards';
import { UnauthorizedExceptionFilter } from '@auth/exception-filters';
import { IAuthenticationResult } from '@auth/interfaces';
import { ResponseInterceptor } from '@common/interceptors';
import { Routes, Docs } from '@common/constants';
import { ApiResult } from '@common/decorators';
import { HttpExceptionFilter } from '@common/exception-filters';
import { OperationResultResponse } from '@common/dto';

@ApiTags(Docs.ru.AUTHORIZATION_CONTROLLER)
@Controller(Routes.ENDPOINT_AUTH)
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: Docs.ru.REGISTRATION_ENDPOINT })
  @ApiBody({ type: RegisterRequest.Swagger.RegisterRequestDto })
  @ApiResult({
    status: 201,
    type: AuthenticationResponse.Swagger.AuthenticationResponseDto,
    description: Docs.ru.REGISTRATION_SUCCESSFUL_RESULT,
  })
  @ApiBadRequestResponse({ description: Docs.ru.REGISTRATION_BAD_REQUEST })
  @UseInterceptors(ResponseInterceptor)
  @UseFilters(HttpExceptionFilter)
  @Post('/registration')
  async registration(@Body() dto: RegisterRequest.Dto, @Res({ passthrough: true }) response: Response) {
    const registerResult = await this.authService.registration(dto);
    AuthController.setupCookies(response, registerResult);
    return new AuthenticationResponse.Dto({
      userId: registerResult.data.user.id,
      accessToken: registerResult.data.payload.accessToken,
    });
  }

  @ApiOperation({ summary: Docs.ru.AUTHORIZATION_ENDPOINT })
  @ApiBody({ type: LoginRequest.Swagger.LoginRequestDto })
  @ApiResult({
    status: 201,
    type: AuthenticationResponse.Swagger.AuthenticationResponseDto,
    description: Docs.ru.AUTHORIZATION_SUCCESSFUL_RESULT,
  })
  @ApiUnauthorizedResponse({ description: Docs.ru.AUTHORIZATION_UNAUTHORIZED })
  @UseGuards(SvgCaptchaGuard)
  @UseFilters(HttpExceptionFilter, UnauthorizedExceptionFilter)
  @UseInterceptors(ResponseInterceptor)
  @Post('/login')
  async login(@Body() dto: LoginRequest.Dto, @Res({ passthrough: true }) response: Response, @Req() request) {
    const loginResult: IAuthenticationResult = await this.authService.login(dto);
    AuthController.setupCookies(response, loginResult);
    AuthController.resetAuthFailedCounter(request);
    return new AuthenticationResponse.Dto({
      userId: loginResult.data.user.id,
      accessToken: loginResult.data.payload.accessToken,
    });
  }

  @ApiOperation({ summary: Docs.ru.REFRESH_TOKENS_ENDPOINT })
  @ApiResult({
    status: 201,
    type: AuthenticationResponse.Swagger.AuthenticationResponseDto,
    description: Docs.ru.REFRESH_TOKENS_SUCCESSFUL_RESULT,
  })
  @ApiUnprocessableEntityResponse({ description: Docs.ru.REFRESH_TOKENS_UNPROCESSABLE_ENTITY })
  @ApiForbiddenResponse({ description: Docs.ru.REFRESH_TOKENS_FORBIDDEN })
  @UseGuards(RefreshTokenGuard)
  @UseInterceptors(ResponseInterceptor)
  @Post('/refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshResult = await this.authService.refresh(request.cookies.refreshToken);
    AuthController.setupCookies(response, refreshResult);
    return new AuthenticationResponse.Dto({
      userId: refreshResult.data.user.id,
      accessToken: refreshResult.data.payload.accessToken,
    });
  }

  @ApiOperation({ summary: Docs.ru.GET_CURRENT_USER_ENDPOINT })
  @ApiResult({
    status: 200,
    type: GetCurrentUserResponse.Swagger.GetCurrentUserResponseDto,
    description: Docs.ru.GET_CURRENT_USER_SUCCESSFUL_RESULT,
  })
  @ApiUnauthorizedResponse({ description: Docs.ru.GET_CURRENT_USER_UNAUTHORIZED })
  @ApiForbiddenResponse({ description: Docs.ru.GET_CURRENT_USER_FORBIDDEN })
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @UseInterceptors(ResponseInterceptor)
  @Get('/me')
  me(@Req() request): Promise<GetCurrentUserResponse.Dto> {
    const userId = request.user.id;
    return this.authService.me(userId);
  }

  @ApiOperation({ summary: Docs.ru.LOGOUT_ENDPOINT })
  @ApiOkResponse({
    type: OperationResultResponse.Swagger.OperationResultResponseDto,
    description: Docs.ru.LOGOUT_SUCCESSFUL_RESULT,
  })
  @ApiUnprocessableEntityResponse({ description: Docs.ru.LOGOUT_UNPROCESSABLE_ENTITY })
  @ApiUnauthorizedResponse({ description: Docs.ru.LOGOUT_UNAUTHORIZED })
  @ApiForbiddenResponse({ description: Docs.ru.LOGOUT_FORBIDDEN })
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @Delete('/logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.logout(request.cookies.refreshToken);
    response.clearCookie('refreshToken');
    return new OperationResultResponse.Dto({ result });
  }

  private static setupCookies(response: Response, data: IAuthenticationResult) {
    if ('refreshToken' in data.data.payload) {
      response.cookie('refreshToken', data.data.payload.refreshToken, {
        httpOnly: true,
        expires: data.data.payload.refreshToken_expiration,
      }); // path: AUTH_PATH
    }
  }

  private static resetAuthFailedCounter(request) {
    const { session } = request;
    session.authFailedCount = null;
  }
}
