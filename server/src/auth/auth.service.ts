import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { GetCurrentUserResponse, LoginRequest, RegisterRequest } from '@auth/dto';
import { IAuthenticationResult } from '@auth/interfaces';
import { SignInAttempt, SignInAttemptsService } from '@auth/sign-in-attempts.service';
import { TokensService } from '@auth/tokens.service';
import { DeviceTrust, TrustedDevicesService } from '@auth/trusted-devices.service';
import { DocumentVersions, ErrorCode, ResultCodes } from '@common/constants';
import { ErrorItemResponse } from '@common/dto';
import { AppException } from '@common/exceptions';
import { SecurityService } from '@security/security.service';
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
    private trustedDevices: TrustedDevicesService,
  ) {}

  /** A registration signs the user in on this device, so the device is trusted from then on. */
  public async registration(dto: RegisterRequest.Dto, deviceToken: unknown): Promise<IAuthenticationResult> {
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

    const deviceTrust = await this.trustedDevices.trust(user.id, deviceToken);
    return AuthService.buildResponsePayload(
      user,
      token,
      refresh,
      this.tokensService.getRefreshTokenExpiration(),
      deviceTrust,
    );
  }

  /**
   * session/captcha-counts-login-only: the attempt is counted first, the password checked only after the captcha; a
   * trusted device is spared the account-wide count and has its trust renewed (session/trusted-device).
   */
  async login(dto: LoginRequest.Dto, address: string, deviceToken: unknown): Promise<IAuthenticationResult> {
    await this.signInAttempts.checkRate(address);
    // Counted by the account the lookup resolves, not by the typed email: every spelling the lookup takes for one
    // account shares its counts.
    const account = await this.userService.getUserByEmail(dto.email, true);
    const trustedDevice = await this.trustedDevices.isTrusted(deviceToken, account?.id ?? null);
    const attempt = await this.signInAttempts.reserve(
      account ? { userId: account.id } : { email: dto.email },
      address,
      trustedDevice,
    );
    if (attempt.demandsCaptcha && !(await this.securityService.solvesCaptcha(dto.captchaId, dto.captcha))) {
      throw AuthService.captchaDemanded(['NEED_AUTHORIZATION_WITH_CAPTCHA']);
    }

    const user = await AuthService.passwordMatches(dto.password, account);
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

    const deviceTrust = await this.trustedDevices.trust(user.id, deviceToken);
    return AuthService.buildResponsePayload(
      user,
      token,
      refresh,
      this.tokensService.getRefreshTokenExpiration(),
      deviceTrust,
    );
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

  /** The account when the password is its own, or null — an unknown email and a wrong password look the same. */
  private static async passwordMatches(password: string, account: User | null): Promise<User | null> {
    const passwordsEqual = await bcrypt.compare(password, account?.password ?? NO_ACCOUNT_PASSWORD_HASH);
    return account && passwordsEqual ? account : null;
  }

  private static signInFailed(attempt: SignInAttempt): AppException {
    if (attempt.nextDemandsCaptcha) {
      return AuthService.captchaDemanded(['INVALID_EMAIL_OR_PASSWORD', 'NEED_AUTHORIZATION_WITH_CAPTCHA']);
    }
    return AppException.of(HttpStatus.UNAUTHORIZED, 'INVALID_EMAIL_OR_PASSWORD');
  }

  private static captchaDemanded(codes: ErrorCode[]): AppException {
    const errors = codes.map(code => new ErrorItemResponse.Dto(code));
    return new AppException(HttpStatus.UNAUTHORIZED, errors, { resultCode: ResultCodes.NEED_CAPTCHA_AUTHORIZATION });
  }

  private static buildResponsePayload(
    user: User,
    accessToken: string,
    refreshToken: string,
    expiration: Date,
    deviceTrust: DeviceTrust | null = null,
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
        deviceTrust,
      },
    };
  }
}
