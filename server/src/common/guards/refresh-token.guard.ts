import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

import { ErrorMessages } from '@common/constants';

/**
 * Requires the session cookie (the refresh token). Without it the request carries no session credential, so the
 * answer is 401 — the same as `JwtAuthGuard` gives for a missing or expired access token — and the client treats
 * both alike: refresh, and on failure end the session on `/login`.
 */
@Injectable()
export class RefreshTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const cookies: Record<string, unknown> = request.cookies ?? {};
    if (!('refreshToken' in cookies)) {
      throw new UnauthorizedException({ message: ErrorMessages.UNAUTHORIZED });
    }

    return true;
  }
}
