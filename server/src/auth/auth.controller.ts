import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CookieOptions, Request, Response } from 'express';

import { AuthService } from '@auth/auth.service';
import { AuthenticationResponse, GetCurrentUserResponse, LoginRequest, RegisterRequest } from '@auth/dto';
import { UnauthorizedExceptionFilter } from '@auth/exception-filters';
import { SvgCaptchaGuard } from '@auth/guards';
import { IAuthenticationResult } from '@auth/interfaces';
import { Docs, ResultCodes, Routes } from '@common/constants';
import { ApiErrorCases, ApiErrorResult, ApiResult } from '@common/decorators';
import { OperationResultResponse } from '@common/dto';
import { JwtAuthGuard, RefreshTokenGuard } from '@common/guards';

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
  @ApiErrorResult({
    status: HttpStatus.BAD_REQUEST,
    description: Docs.REGISTRATION_BAD_REQUEST,
    cases: {
      invalidFields: [
        { code: 'MUST_HAS_EMAIL_FORMAT', field: 'email' },
        {
          code: 'STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N',
          params: { min: 8, max: 50 },
          field: 'password',
        },
        { code: 'CONSENT_TO_PERSONAL_DATA_PROCESSING_IS_REQUIRED', field: 'consent' },
        { code: 'TERMS_ACCEPTANCE_IS_REQUIRED', field: 'termsAccepted' },
      ],
      userExists: [{ code: 'USER_ALREADY_EXISTS' }],
      creationFailed: [{ code: 'FAILED_TO_CREATE_USER' }],
    },
  })
  @ApiErrorResult({
    status: HttpStatus.FORBIDDEN,
    description: Docs.REGISTRATION_FORBIDDEN,
    cases: { roleMissing: [{ code: 'USER_ROLE_CONFIGURATION_IS_MISSING' }] },
  })
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
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.AUTHORIZATION_UNAUTHORIZED,
    cases: {
      invalidCredentials: [{ code: 'INVALID_EMAIL_OR_PASSWORD' }],
      captchaRequired: {
        errors: [{ code: 'INVALID_EMAIL_OR_PASSWORD' }, { code: 'NEED_AUTHORIZATION_WITH_CAPTCHA' }],
        resultCode: ResultCodes.NEED_CAPTCHA_AUTHORIZATION,
      },
      wrongCaptcha: {
        errors: [{ code: 'NEED_AUTHORIZATION_WITH_CAPTCHA' }],
        resultCode: ResultCodes.NEED_CAPTCHA_AUTHORIZATION,
      },
    },
  })
  @ApiErrorResult({
    status: HttpStatus.BAD_REQUEST,
    description: Docs.AUTHORIZATION_BAD_REQUEST,
    cases: { invalidFields: [{ code: 'MUST_BE_A_STRING', field: 'email' }] },
  })
  @UseGuards(SvgCaptchaGuard)
  @UseFilters(UnauthorizedExceptionFilter)
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
  @ApiErrorResult({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: Docs.REFRESH_TOKENS_UNPROCESSABLE_ENTITY,
    cases: {
      malformed: [{ code: 'REFRESH_TOKEN_IS_MALFORMED' }],
      expired: [{ code: 'REFRESH_TOKEN_EXPIRED' }],
      notFound: [{ code: 'REFRESH_TOKEN_NOT_FOUND' }],
      revoked: [{ code: 'REFRESH_TOKEN_REVOKED' }],
    },
  })
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.REFRESH_TOKENS_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @UseGuards(RefreshTokenGuard)
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
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.GET_CURRENT_USER_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
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
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.ACCEPT_DOCUMENTS_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @Patch('/documents-acceptance')
  acceptDocuments(@Req() request): Promise<GetCurrentUserResponse.Dto> {
    return this.authService.acceptDocuments(request.user.id);
  }

  @ApiOperation({ summary: Docs.LOGOUT_ENDPOINT })
  @ApiResult({
    status: 200,
    type: OperationResultResponse.Swagger.OperationResultResponseDto,
    description: Docs.LOGOUT_SUCCESSFUL_RESULT,
  })
  @ApiErrorResult({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: Docs.LOGOUT_UNPROCESSABLE_ENTITY,
    cases: {
      malformed: [{ code: 'REFRESH_TOKEN_IS_MALFORMED' }],
      expired: [{ code: 'REFRESH_TOKEN_EXPIRED' }],
    },
  })
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.LOGOUT_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @Delete('/logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.logout(request.cookies.refreshToken);
    response.clearCookie('refreshToken', AuthController.refreshCookieBaseOptions());
    return new OperationResultResponse.Dto({ result });
  }

  @ApiOperation({ summary: Docs.DELETE_ACCOUNT_ENDPOINT })
  @ApiResult({
    status: 200,
    type: OperationResultResponse.Swagger.OperationResultResponseDto,
    description: Docs.DELETE_ACCOUNT_SUCCESSFUL_RESULT,
  })
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: Docs.DELETE_ACCOUNT_UNAUTHORIZED,
    cases: ApiErrorCases.UNAUTHORIZED,
  })
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
