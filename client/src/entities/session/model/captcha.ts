import { type CommonResponseEnvelope, ResultCodes } from '@shared/api';

/** The server asks for a captcha before it accepts another login attempt. */
export function isNeedCaptchaEnvelope(envelope: CommonResponseEnvelope<unknown>): boolean {
  return envelope.resultCode === ResultCodes.NEED_CAPTCHA_AUTHORIZATION;
}
