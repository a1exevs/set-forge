import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken';

import { RefreshToken } from '@auth/refresh-tokens.model';
import { RefreshTokensService } from '@auth/refresh-tokens.service';
import { AppException } from '@common/exceptions';
import { User } from '@users/users.model';
import { UsersService } from '@users/users.service';

// TODO Replace
const BASE_OPTIONS: SignOptions = {
  issuer: 'https://sowa-api.com',
  audience: 'https://sowa-api.com',
};

export interface RefreshTokenPayload {
  jti: number;
  sub: number;
}

@Injectable()
export class TokensService {
  private readonly refreshTokensService: RefreshTokensService;
  private readonly usersService: UsersService;
  private readonly jwtService: JwtService;

  public constructor(refreshTokensService: RefreshTokensService, usersService: UsersService, jwtService: JwtService) {
    this.refreshTokensService = refreshTokensService;
    this.usersService = usersService;
    this.jwtService = jwtService;
  }

  public async generateAccessToken(user: User): Promise<string> {
    const payload = { email: user.email, id: user.id, roles: user.roles };
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user.id),
    };

    return this.jwtService.signAsync(payload, opts);
  }

  public async generateRefreshToken(user: User, expiresIn: number): Promise<string> {
    const token = await this.refreshTokensService.createRefreshToken(user, expiresIn);

    const opts: SignOptions = {
      ...BASE_OPTIONS,
      expiresIn,
      subject: String(user.id),
      jwtid: String(token.uuid),
    };

    return this.jwtService.signAsync({}, opts);
  }

  public async updateAccessRefreshTokensFromRefreshToken(
    refresh: string,
  ): Promise<{ refreshToken: string; accessToken: string; user: User }> {
    const { user, newRefreshToken } = await this.updateRefreshToken(refresh);
    const accessToken = await this.generateAccessToken(user);

    return { user, accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Removes the stored record the token names; an expired token still names it. Never fails: a token that is damaged,
   * not signed by us or already removed leaves nothing to remove.
   */
  public async revokeRefreshToken(refreshToken: string): Promise<void> {
    let payload: Partial<RefreshTokenPayload>;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, { ignoreExpiration: true });
    } catch {
      return;
    }

    if (payload.jti) {
      await this.refreshTokensService.removeTokenByUUId(payload.jti);
    }
  }

  public static getRefreshTokenExpiresIn(): number {
    return 60 * 60 * 24 * 30 * 1000;
  }

  public getRefreshTokenExpiration(): Date {
    const expiration = new Date();
    expiration.setTime(expiration.getTime() + TokensService.getRefreshTokenExpiresIn());
    return expiration;
  }

  private async updateRefreshToken(encoded: string): Promise<{ user: User; newRefreshToken: string }> {
    const payload = await this.decodeRefreshToken(encoded);
    const token = await this.getStoredTokenFromRefreshTokenPayload(payload);

    await this.revokeRefreshToken(encoded);

    if (!token) {
      throw AppException.of(HttpStatus.UNAUTHORIZED, 'REFRESH_TOKEN_NOT_FOUND');
    }

    if (token.isRevoked) {
      throw AppException.of(HttpStatus.UNAUTHORIZED, 'REFRESH_TOKEN_REVOKED');
    }

    const user = await this.getUserFromRefreshTokenPayload(payload);

    if (!user) {
      throw AppException.of(HttpStatus.UNAUTHORIZED, 'REFRESH_TOKEN_IS_MALFORMED');
    }

    const newRefreshToken = await this.generateRefreshToken(user, TokensService.getRefreshTokenExpiresIn());

    return { user, newRefreshToken };
  }

  private async decodeRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw AppException.of(HttpStatus.UNAUTHORIZED, 'REFRESH_TOKEN_EXPIRED');
      } else {
        throw AppException.of(HttpStatus.UNAUTHORIZED, 'REFRESH_TOKEN_IS_MALFORMED');
      }
    }
  }

  private async getUserFromRefreshTokenPayload(payload: RefreshTokenPayload): Promise<User> {
    const subId = payload.sub;

    if (!subId) {
      throw AppException.of(HttpStatus.UNAUTHORIZED, 'REFRESH_TOKEN_IS_MALFORMED');
    }

    return this.usersService.getUserById(subId);
  }

  private async getStoredTokenFromRefreshTokenPayload(payload: RefreshTokenPayload): Promise<RefreshToken | null> {
    const tokenId = payload.jti;

    if (!tokenId) {
      throw AppException.of(HttpStatus.UNAUTHORIZED, 'REFRESH_TOKEN_IS_MALFORMED');
    }

    return this.refreshTokensService.findTokenByUUId(tokenId);
  }
}
