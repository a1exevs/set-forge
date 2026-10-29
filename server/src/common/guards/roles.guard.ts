import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { ROLES_KEY } from '@common/decorators';
import { AppException } from '@common/exceptions';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

/** A missing or invalid access token is the parent's 401; a valid one without the required roles is a 403. */
@Injectable()
export class RolesGuard extends JwtAuthGuard {
  constructor(
    jwtService: JwtService,
    private reflector: Reflector,
  ) {
    super(jwtService);
  }

  canActivate(context: ExecutionContext): boolean {
    super.canActivate(context);

    const { user } = context.switchToHttp().getRequest();
    const requiredRoles =
      this.reflector.getAllAndOverride<string[] | undefined>(ROLES_KEY, [context.getHandler(), context.getClass()]) ??
      [];
    const userRoles = user.roles ?? [];
    const hasRoles = requiredRoles.every(requiredRole => userRoles.some(userRole => userRole.value === requiredRole));
    if (!hasRoles) {
      throw AppException.of(HttpStatus.FORBIDDEN, 'NOT_ENOUGH_PERMISSIONS');
    }
    return true;
  }
}
