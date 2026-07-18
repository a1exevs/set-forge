import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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
import { CookieOptions, Request, Response } from 'express';

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

@ApiTags(Docs.AUTHORIZATION_CONTROLLER)
@Controller(Routes.ENDPOINT_AUTH)
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: Docs.REGISTRATION_ENDPOINT })
  @ApiBody({ type: RegisterRequest.Swagger.RegisterRequestDto })
  @ApiResult({
    status: 201,
    type: AuthenticationResponse.Swagger.AuthenticationResponseDto,
    description: Docs.REGISTRATION_SUCCESSFUL_RESULT,
  })
  @ApiBadRequestResponse({ description: Docs.REGISTRATION_BAD_REQUEST })
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

  @ApiOperation({ summary: Docs.AUTHORIZATION_ENDPOINT })
  @ApiBody({ type: LoginRequest.Swagger.LoginRequestDto })
  @ApiResult({
    status: 201,
    type: AuthenticationResponse.Swagger.AuthenticationResponseDto,
    description: Docs.AUTHORIZATION_SUCCESSFUL_RESULT,
  })
  @ApiUnauthorizedResponse({ description: Docs.AUTHORIZATION_UNAUTHORIZED })
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

  @ApiOperation({ summary: Docs.REFRESH_TOKENS_ENDPOINT })
  @ApiResult({
    status: 201,
    type: AuthenticationResponse.Swagger.AuthenticationResponseDto,
    description: Docs.REFRESH_TOKENS_SUCCESSFUL_RESULT,
  })
  @ApiUnprocessableEntityResponse({ description: Docs.REFRESH_TOKENS_UNPROCESSABLE_ENTITY })
  @ApiForbiddenResponse({ description: Docs.REFRESH_TOKENS_FORBIDDEN })
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

  @ApiOperation({ summary: Docs.GET_CURRENT_USER_ENDPOINT })
  @ApiResult({
    status: 200,
    type: GetCurrentUserResponse.Swagger.GetCurrentUserResponseDto,
    description: Docs.GET_CURRENT_USER_SUCCESSFUL_RESULT,
  })
  @ApiUnauthorizedResponse({ description: Docs.GET_CURRENT_USER_UNAUTHORIZED })
  @ApiForbiddenResponse({ description: Docs.GET_CURRENT_USER_FORBIDDEN })
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @UseInterceptors(ResponseInterceptor)
  @Get('/me')
  me(@Req() request): Promise<GetCurrentUserResponse.Dto> {
    const userId = request.user.id;
    return this.authService.me(userId);
  }

  @ApiOperation({ summary: Docs.ACCEPT_DOCUMENTS_ENDPOINT })
  @ApiResult({
    status: 200,
    type: GetCurrentUserResponse.Swagger.GetCurrentUserResponseDto,
    description: Docs.ACCEPT_DOCUMENTS_SUCCESSFUL_RESULT,
  })
  @ApiUnauthorizedResponse({ description: Docs.ACCEPT_DOCUMENTS_UNAUTHORIZED })
  @ApiForbiddenResponse({ description: Docs.ACCEPT_DOCUMENTS_FORBIDDEN })
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @UseInterceptors(ResponseInterceptor)
  @Patch('/documents-acceptance')
  acceptDocuments(@Req() request): Promise<GetCurrentUserResponse.Dto> {
    return this.authService.acceptDocuments(request.user.id);
  }

  @ApiOperation({ summary: Docs.LOGOUT_ENDPOINT })
  @ApiOkResponse({
    type: OperationResultResponse.Swagger.OperationResultResponseDto,
    description: Docs.LOGOUT_SUCCESSFUL_RESULT,
  })
  @ApiUnprocessableEntityResponse({ description: Docs.LOGOUT_UNPROCESSABLE_ENTITY })
  @ApiUnauthorizedResponse({ description: Docs.LOGOUT_UNAUTHORIZED })
  @ApiForbiddenResponse({ description: Docs.LOGOUT_FORBIDDEN })
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @Delete('/logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.logout(request.cookies.refreshToken);
    response.clearCookie('refreshToken', AuthController.refreshCookieBaseOptions());
    return new OperationResultResponse.Dto({ result });
  }

  @ApiOperation({ summary: Docs.DELETE_ACCOUNT_ENDPOINT })
  @ApiOkResponse({
    type: OperationResultResponse.Swagger.OperationResultResponseDto,
    description: Docs.DELETE_ACCOUNT_SUCCESSFUL_RESULT,
  })
  @ApiUnauthorizedResponse({ description: Docs.DELETE_ACCOUNT_UNAUTHORIZED })
  @ApiForbiddenResponse({ description: Docs.DELETE_ACCOUNT_FORBIDDEN })
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @Delete('/account')
  async deleteAccount(@Req() request, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.deleteAccount(request.user.id);
    response.clearCookie('refreshToken', AuthController.refreshCookieBaseOptions());
    return new OperationResultResponse.Dto({ result });
  }

  private static setupCookies(response: Response, data: IAuthenticationResult) {
    if ('refreshToken' in data.data.payload) {
      response.cookie('refreshToken', data.data.payload.refreshToken, {
        ...AuthController.refreshCookieBaseOptions(),
        expires: data.data.payload.refreshToken_expiration,
      }); // path: AUTH_PATH
    }
  }

  // `secure: true` is required for SameSite policies in modern browsers; `localhost` is treated as a secure context, so dev still works.
  // Using the SAME options for both `cookie` and `clearCookie` is required for the browser to actually drop the cookie on logout.
  private static refreshCookieBaseOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    };
  }

  private static resetAuthFailedCounter(request) {
    const { session } = request;
    session.authFailedCount = null;
  }
}
