import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

import { ErrorMessages } from '@common/constants';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const cookies = request.cookies;
      if (!('refreshToken' in cookies)) {
        throw new UnauthorizedException({ message: ErrorMessages.ru.UNAUTHORIZED });
      }

      return true;
    } catch (e) {
      throw new ForbiddenException(ErrorMessages.ru.FORBIDDEN);
    }
  }
}
