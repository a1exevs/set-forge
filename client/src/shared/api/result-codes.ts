/** Mirrors server `ResultCodes` used by the client. */
export const ResultCodes = {
  OK: 0,
  ERROR: 1,
  NEED_CAPTCHA_AUTHORIZATION: 10,
} as const;
