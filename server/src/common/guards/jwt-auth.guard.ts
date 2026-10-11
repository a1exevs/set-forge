import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

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
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException({ message: ErrorMessages.UNAUTHORIZED });
      }

      const user = this.jstService.verify(token);
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException({ message: ErrorMessages.UNAUTHORIZED });
    }
  }
}
