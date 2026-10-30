import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AppException } from '@common/exceptions';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jstService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    try {
      const authHeader = request.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      if (bearer !== 'Bearer' || !token) {
        throw AppException.of(HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
      }

      const user = this.jstService.verify(token);
      request.user = user;
      return true;
    } catch {
      throw AppException.of(HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
    }
  }
}
