import { type CommonResponseEnvelope, ResultCodes } from '@shared/api';

/** A captcha image and the id its answer is sent back with. */
export type Captcha = { id: string; imageUrl: string };

/** The server asks for a captcha before it accepts another login attempt. */
export function isNeedCaptchaEnvelope(envelope: CommonResponseEnvelope<unknown>): boolean {
  return envelope.resultCode === ResultCodes.NEED_CAPTCHA_AUTHORIZATION;
}
