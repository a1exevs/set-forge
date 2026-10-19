import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

import { LoginRequest } from '@auth/dto';
import { Isession } from '@auth/interfaces';
import { AppException } from '@common/exceptions';

export const MAX_AUTH_FAILED_COUNT = 5;

@Injectable()
export class SvgCaptchaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const session: Isession = request.session;
    const body: LoginRequest.Dto = request.body;
    const captchaText = session.captcha;
    session.captcha = null;

    if (Number(session.authFailedCount) >= MAX_AUTH_FAILED_COUNT) {
      if (captchaText === body.captcha) {
        return true;
      }

      throw AppException.of(HttpStatus.UNAUTHORIZED, 'NEED_AUTHORIZATION_WITH_CAPTCHA');
    }

    return true;
  }
}
