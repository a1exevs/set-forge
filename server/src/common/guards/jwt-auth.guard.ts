import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

import { ErrorMessages } from '@common/constants';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jstService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const authHeader = request.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      if (bearer !== 'Bearer' || !token) throw new UnauthorizedException({ message: ErrorMessages.ru.UNAUTHORIZED });

      const user = this.jstService.verify(token);
      request.user = user;
      return true;
    } catch (e) {
      throw new UnauthorizedException({ message: ErrorMessages.ru.UNAUTHORIZED });
    }
  }
}
