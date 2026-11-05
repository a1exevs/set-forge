import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';

import { RefreshTokensService } from '@auth/refresh-tokens.service';
import { AppException } from '@common/exceptions';
import { User } from '@users/users.model';
import { UsersService } from '@users/users.service';

const REFRESH_TOKEN_BYTES = 32;

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
    return this.jwtService.signAsync(payload, { subject: String(user.id) });
  }

  /**
   * An opaque random value, not a JWT: only its stored record gives it meaning — session/access-token-only.
   * `null` when the user no longer exists, so no token is issued (session/deletion-during-sign-in).
   */
  public async generateRefreshToken(user: User, ttl: number): Promise<string | null> {
    const refreshToken = randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
    const stored = await this.refreshTokensService.createRefreshToken(
      user.id,
      TokensService.hashRefreshToken(refreshToken),
      ttl,
    );

    return stored ? refreshToken : null;
  }

  public async updateAccessRefreshTokensFromRefreshToken(
    refresh: unknown,
  ): Promise<{ refreshToken: string; accessToken: string; user: User }> {
    const { user, newRefreshToken } = await this.updateRefreshToken(refresh);
    const accessToken = await this.generateAccessToken(user);

    return { user, accessToken, refreshToken: newRefreshToken };
  }

  /** Removes the stored record of the token whatever its state; a value naming no record leaves nothing to remove. */
  public async revokeRefreshToken(refreshToken: unknown): Promise<void> {
    if (typeof refreshToken !== 'string') {
      return;
    }

    await this.refreshTokensService.removeTokenByHash(TokensService.hashRefreshToken(refreshToken));
  }

  public static getRefreshTokenExpiresIn(): number {
    return 60 * 60 * 24 * 30 * 1000;
  }

  public getRefreshTokenExpiration(): Date {
    const expiration = new Date();
    expiration.setTime(expiration.getTime() + TokensService.getRefreshTokenExpiresIn());
    return expiration;
  }

  /** The token carries 256 random bits, so a plain SHA-256 suffices: guessing needs no salt or slow hash to stop it. */
  private static hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  private async updateRefreshToken(refreshToken: unknown): Promise<{ user: User; newRefreshToken: string }> {
    if (typeof refreshToken !== 'string') {
      throw AppException.of(HttpStatus.UNAUTHORIZED, 'REFRESH_TOKEN_NOT_FOUND');
    }

    const tokenHash = TokensService.hashRefreshToken(refreshToken);
    const token = await this.refreshTokensService.findTokenByHash(tokenHash);

    if (!token) {
      throw AppException.of(HttpStatus.UNAUTHORIZED, 'REFRESH_TOKEN_NOT_FOUND');
    }

    // Only the request whose delete removed the record goes on, so a token racing itself or a logout is spent once
    // (session/refresh-token-single-use); it goes before any further check, so a refused token is spent as well.
    if ((await this.refreshTokensService.removeTokenByHash(tokenHash)) === 0) {
      throw AppException.of(HttpStatus.UNAUTHORIZED, 'REFRESH_TOKEN_NOT_FOUND');
    }

    // session/refresh-token-lifetime
    if (token.expires.getTime() <= Date.now()) {
      throw AppException.of(HttpStatus.UNAUTHORIZED, 'REFRESH_TOKEN_EXPIRED');
    }

    const user = await this.usersService.getUserById(token.userId);

    if (!user) {
      throw AppException.of(HttpStatus.UNAUTHORIZED, 'REFRESH_TOKEN_NOT_FOUND');
    }

    const newRefreshToken = await this.generateRefreshToken(user, TokensService.getRefreshTokenExpiresIn());

    // session/deletion-during-sign-in: answered as when the user was gone at the lookup above.
    if (!newRefreshToken) {
      throw AppException.of(HttpStatus.UNAUTHORIZED, 'REFRESH_TOKEN_NOT_FOUND');
    }

    return { user, newRefreshToken };
  }
}
