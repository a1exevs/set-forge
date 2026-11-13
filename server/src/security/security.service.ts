import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as svgCaptcha from 'svg-captcha';

import { AppException } from '@common/exceptions';
import { REDIS_CLIENT, RedisClient } from '@src/redis';

/** session/captcha-counts-login-only */
export const CAPTCHA_LIFETIME_SECONDS = 5 * 60;

const captchaKey = (captchaId: string): string => `captcha:${captchaId}`;

@Injectable()
export class SecurityService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: RedisClient) {}

  /** A new captcha image; its answer is kept for its lifetime under the returned id, apart from any earlier one. */
  public async createCaptcha(): Promise<{ captchaURL: string; captchaId: string }> {
    const captcha = svgCaptcha.create();
    const captchaId = randomUUID();
    await SecurityService.whileAvailable(() =>
      this.redis.set(captchaKey(captchaId), captcha.text, { EX: CAPTCHA_LIFETIME_SECONDS }),
    );

    const captchaURL = `data:image/svg+xml;base64,${Buffer.from(captcha.data).toString('base64')}`;
    return { captchaURL, captchaId };
  }

  /**
   * Whether the answer is right. The stored answer is taken in the same step, so a captcha is checked once even when
   * requests overlap — session/captcha-counts-login-only.
   */
  public async solvesCaptcha(captchaId: string | undefined, answer: string | undefined): Promise<boolean> {
    if (!captchaId || !answer) {
      return false;
    }
    const stored = await SecurityService.whileAvailable(() => this.redis.getDel(captchaKey(captchaId)));
    return stored !== null && stored === answer;
  }

  // The captcha guards the sign-in, so without its store the sign-in is closed rather than left unguarded.
  private static async whileAvailable<T>(call: () => Promise<T>): Promise<T> {
    try {
      return await call();
    } catch (cause) {
      throw AppException.of(HttpStatus.SERVICE_UNAVAILABLE, 'SIGN_IN_TEMPORARILY_UNAVAILABLE', {}, cause as Error);
    }
  }
}
