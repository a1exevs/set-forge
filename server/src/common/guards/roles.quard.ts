import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

import { ROLES_KEY } from '@common/decorators';
import { AppException } from '@common/exceptions';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private jstService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      if (bearer !== 'Bearer' || !token) {
        throw AppException.of(HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
      }

      const user = this.jstService.verify(token);
      request.user = user;

      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (requiredRoles) {
        let haveRoles = true;
        requiredRoles.forEach(requiredRole => {
          haveRoles = haveRoles && user.roles.some(userRole => userRole.value === requiredRole);
        });
        if (!haveRoles) {
          throw AppException.of(HttpStatus.FORBIDDEN, 'NOT_ENOUGH_PERMISSIONS');
        }
      }
      return true;
    } catch {
      throw AppException.of(HttpStatus.FORBIDDEN, 'FORBIDDEN');
    }
  }
}
