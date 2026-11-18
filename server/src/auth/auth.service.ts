import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { GetCurrentUserResponse, LoginRequest, RegisterRequest } from '@auth/dto';
import { IAuthenticationResult } from '@auth/interfaces';
import { SignInAttempt, SignInAttemptsService } from '@auth/sign-in-attempts.service';
import { TokensService } from '@auth/tokens.service';
import { DocumentVersions, ErrorCode, ResultCodes } from '@common/constants';
import { ErrorItemResponse } from '@common/dto';
import { AppException } from '@common/exceptions';
import { SecurityService } from '@security/security.service';
import { CreateUserRequest } from '@users/dto';
import { User } from '@users/users.model';
import { UsersService } from '@users/users.service';

// Compared against when the email names no account, so an unknown email costs the same time as a wrong password.
const NO_ACCOUNT_PASSWORD_HASH = bcrypt.hashSync('no account has this password', 5);

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private tokensService: TokensService,
    private signInAttempts: SignInAttemptsService,
    private securityService: SecurityService,
  ) {}

  public async registration(dto: RegisterRequest.Dto): Promise<IAuthenticationResult> {
    const candidate = await this.userService.getUserByEmail(dto.email);
    if (candidate) {
      throw AppException.of(HttpStatus.CONFLICT, 'USER_ALREADY_EXISTS');
    }

    const hashPassword = await bcrypt.hash(dto.password, 5);
    const user = await this.userService.createUser({ ...dto, password: hashPassword });

    const token = await this.tokensService.generateAccessToken(user);
    const refresh = await this.tokensService.generateRefreshToken(user, TokensService.getRefreshTokenExpiresIn());
    if (!refresh) {
      throw AppException.of(HttpStatus.BAD_REQUEST, 'FAILED_TO_CREATE_USER');
    }

    return AuthService.buildResponsePayload(user, token, refresh, this.tokensService.getRefreshTokenExpiration());
  }

  /** session/captcha-counts-login-only: the attempt is counted first, the password checked only after the captcha. */
  async login(dto: LoginRequest.Dto, address: string): Promise<IAuthenticationResult> {
    const attempt = await this.signInAttempts.reserve(dto.email, address);
    if (attempt.demandsCaptcha && !(await this.securityService.solvesCaptcha(dto.captchaId, dto.captcha))) {
      throw AuthService.captchaDemanded(['NEED_AUTHORIZATION_WITH_CAPTCHA']);
    }

    const user = await this.validateUser(dto);
    if (!user) {
      throw AuthService.signInFailed(attempt);
    }
    await this.signInAttempts.succeeded(attempt);

    const token = await this.tokensService.generateAccessToken(user);
    const refresh = await this.tokensService.generateRefreshToken(user, TokensService.getRefreshTokenExpiresIn());
    // session/deletion-during-sign-in: answered as a sign-in after the deletion.
    if (!refresh) {
      throw AppException.of(HttpStatus.UNAUTHORIZED, 'INVALID_EMAIL_OR_PASSWORD');
    }

    return AuthService.buildResponsePayload(user, token, refresh, this.tokensService.getRefreshTokenExpiration());
  }

  public async refresh(currentRefreshToken: unknown): Promise<IAuthenticationResult> {
    const { user, accessToken, refreshToken } =
      await this.tokensService.updateAccessRefreshTokensFromRefreshToken(currentRefreshToken);
    return AuthService.buildResponsePayload(
      user,
      accessToken,
      refreshToken,
      this.tokensService.getRefreshTokenExpiration(),
    );
  }

  public async me(userId: number): Promise<GetCurrentUserResponse.Dto> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw AppException.of(HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
    }

    return new GetCurrentUserResponse.Dto({
      id: user.id,
      email: user.email,
      documentsPendingAcceptance: AuthService.documentsPendingAcceptance(user),
    });
  }

  public async acceptDocuments(userId: number): Promise<GetCurrentUserResponse.Dto> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw AppException.of(HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
    }
    await this.userService.updateDocumentAcceptance(userId);
    return this.me(userId);
  }

  // Re-acceptance is required when a stored version is missing (legacy users) or older than the
  // current required version (a document changed materially — see DocumentVersions).
  private static documentsPendingAcceptance(user: User): boolean {
    const { acceptedTermsVersion, acceptedPrivacyVersion } = user;
    return (
      acceptedTermsVersion == null ||
      acceptedPrivacyVersion == null ||
      acceptedTermsVersion < DocumentVersions.terms() ||
      acceptedPrivacyVersion < DocumentVersions.privacy()
    );
  }

  public async logout(refreshToken: unknown): Promise<void> {
    await this.tokensService.revokeRefreshToken(refreshToken);
  }

  public async deleteAccount(userId: number): Promise<boolean> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw AppException.of(HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
    }
    return this.userService.deleteUser(userId);
  }

  /** The user the email and the password name, or null — an unknown email and a wrong password look the same. */
  private async validateUser(dto: CreateUserRequest.Dto): Promise<User | null> {
    const user = await this.userService.getUserByEmail(dto.email, true);
    const passwordsEqual = await bcrypt.compare(dto.password, user?.password ?? NO_ACCOUNT_PASSWORD_HASH);
    return user && passwordsEqual ? user : null;
  }

  private static signInFailed(attempt: SignInAttempt): AppException {
    if (attempt.nextDemandsCaptcha) {
      return AuthService.captchaDemanded(['INVALID_EMAIL_OR_PASSWORD', 'NEED_AUTHORIZATION_WITH_CAPTCHA']);
    }
    return AppException.of(HttpStatus.UNAUTHORIZED, 'INVALID_EMAIL_OR_PASSWORD');
  }

  private static captchaDemanded(codes: ErrorCode[]): AppException {
    const errors = codes.map(code => new ErrorItemResponse.Dto(code));
    return new AppException(HttpStatus.UNAUTHORIZED, errors, undefined, ResultCodes.NEED_CAPTCHA_AUTHORIZATION);
  }

  private static buildResponsePayload(
    user: User,
    accessToken: string,
    refreshToken: string,
    expiration: Date,
  ): IAuthenticationResult {
    return {
      status: 'success',
      data: {
        user: {
          id: user.id,
        },
        payload: {
          type: 'bearer',
          accessToken,
          refreshToken,
          refreshToken_expiration: expiration,
        },
      },
    };
  }
}
