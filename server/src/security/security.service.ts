import { Injectable } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';

@Injectable()
export class SecurityService {
  public getCaptchaURL(): { captchaURL: string; captchaText: string } {
    const captcha = svgCaptcha.create();
    const captchaURL = `data:image/svg+xml;base64,${Buffer.from(captcha.data).toString('base64')}`;
    return { captchaURL, captchaText: captcha.text };
  }
}
