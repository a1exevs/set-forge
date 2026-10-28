import type { Translate } from '@shared/lib';

import { type ApiErrorItem, type ErrorCode, type ErrorParams, isErrorCode } from './api-error';
import { ApiRequestError } from './http-client';

type ErrorText = (t: Translate, params: ErrorParams) => string;

// One static key per code: the dictionary checks read `t('…')` calls, and `Record` makes a code without a text fail tsc.
const ERROR_TEXTS: Record<ErrorCode, ErrorText> = {
  MUST_BE_A_NUMBER: (t, params) => t('errors.MUST_BE_A_NUMBER', params),
  MUST_BE_AN_INTEGER_NUMBER: (t, params) => t('errors.MUST_BE_AN_INTEGER_NUMBER', params),
  MUST_BE_A_STRING: (t, params) => t('errors.MUST_BE_A_STRING', params),
  MUST_BE_AN_ARRAY: (t, params) => t('errors.MUST_BE_AN_ARRAY', params),
  MUST_BE_A_UUID: (t, params) => t('errors.MUST_BE_A_UUID', params),
  MUST_BE_ONE_OF: (t, params) => t('errors.MUST_BE_ONE_OF', params),
  MUST_HAS_EMAIL_FORMAT: (t, params) => t('errors.MUST_HAS_EMAIL_FORMAT', params),
  CONSENT_TO_PERSONAL_DATA_PROCESSING_IS_REQUIRED: (t, params) =>
    t('errors.CONSENT_TO_PERSONAL_DATA_PROCESSING_IS_REQUIRED', params),
  TERMS_ACCEPTANCE_IS_REQUIRED: (t, params) => t('errors.TERMS_ACCEPTANCE_IS_REQUIRED', params),
  STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N: (t, params) =>
    t('errors.STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N', params),
  NUMERIC_MUST_NOT_BE_LESS_THAN_N: (t, params) => t('errors.NUMERIC_MUST_NOT_BE_LESS_THAN_N', params),
  NUMERIC_MUST_NOT_BE_GREATER_THAN_N: (t, params) => t('errors.NUMERIC_MUST_NOT_BE_GREATER_THAN_N', params),
  ARRAY_MUST_NOT_BE_SHORTER_THAN_N: (t, params) => t('errors.ARRAY_MUST_NOT_BE_SHORTER_THAN_N', params),
  UNAUTHORIZED: (t, params) => t('errors.UNAUTHORIZED', params),
  NEED_AUTHORIZATION_WITH_CAPTCHA: (t, params) => t('errors.NEED_AUTHORIZATION_WITH_CAPTCHA', params),
  FORBIDDEN: (t, params) => t('errors.FORBIDDEN', params),
  NOT_ENOUGH_PERMISSIONS: (t, params) => t('errors.NOT_ENOUGH_PERMISSIONS', params),
  INVALID_EMAIL_OR_PASSWORD: (t, params) => t('errors.INVALID_EMAIL_OR_PASSWORD', params),
  USER_ROLE_CONFIGURATION_IS_MISSING: (t, params) => t('errors.USER_ROLE_CONFIGURATION_IS_MISSING', params),
  REFRESH_TOKEN_IS_MALFORMED: (t, params) => t('errors.REFRESH_TOKEN_IS_MALFORMED', params),
  REFRESH_TOKEN_EXPIRED: (t, params) => t('errors.REFRESH_TOKEN_EXPIRED', params),
  REFRESH_TOKEN_NOT_FOUND: (t, params) => t('errors.REFRESH_TOKEN_NOT_FOUND', params),
  REFRESH_TOKEN_REVOKED: (t, params) => t('errors.REFRESH_TOKEN_REVOKED', params),
  USER_ALREADY_EXISTS: (t, params) => t('errors.USER_ALREADY_EXISTS', params),
  FAILED_TO_CREATE_USER: (t, params) => t('errors.FAILED_TO_CREATE_USER', params),
  FAILED_TO_CREATE_ROLE: (t, params) => t('errors.FAILED_TO_CREATE_ROLE', params),
  INVALID_IMPORT_FILE_FORMAT: (t, params) => t('errors.INVALID_IMPORT_FILE_FORMAT', params),
  UNSUPPORTED_EXPORT_FILE_VERSION: (t, params) => t('errors.UNSUPPORTED_EXPORT_FILE_VERSION', params),
  BAD_REQUEST: (t, params) => t('errors.BAD_REQUEST', params),
  NOT_FOUND: (t, params) => t('errors.NOT_FOUND', params),
  UNPROCESSABLE_ENTITY: (t, params) => t('errors.UNPROCESSABLE_ENTITY', params),
  PAYLOAD_TOO_LARGE: (t, params) => t('errors.PAYLOAD_TOO_LARGE', params),
  INTERNAL_ERROR: (t, params) => t('errors.INTERNAL_ERROR', params),
  NETWORK_ERROR: (t, params) => t('errors.NETWORK_ERROR', params),
  UNEXPECTED_RESPONSE: (t, params) => t('errors.UNEXPECTED_RESPONSE', params),
};

/** The text of one error in the chosen language; a code the client does not know keeps the server's English text. */
const textOf = (item: ApiErrorItem, t: Translate): string =>
  isErrorCode(item.code) ? ERROR_TEXTS[item.code](t, item.params) : item.message;

export type ApiErrorTexts = {
  /** A field error by its request path (`email`, `exercises.0.sets`) — the first one when a field has several. */
  byField: Record<string, string>;
  /** The errors without a field, in order. */
  general: string[];
};

/** The errors of a failed request as texts in the chosen language; anything but `ApiRequestError` has none. */
export const apiErrorTexts = (error: unknown, t: Translate): ApiErrorTexts => {
  const texts: ApiErrorTexts = { byField: {}, general: [] };
  if (!(error instanceof ApiRequestError)) {
    return texts;
  }
  for (const item of error.errors) {
    const text = textOf(item, t);
    if (item.field === undefined) {
      texts.general.push(text);
    } else if (!(item.field in texts.byField)) {
      texts.byField[item.field] = text;
    }
  }
  return texts;
};

/** One line for a toast: every error of a failed request, field ones included; `null` when it carries none. */
export const apiErrorText = (error: unknown, t: Translate): string | null => {
  const { byField, general } = apiErrorTexts(error, t);
  const lines = [...general, ...Object.values(byField)];
  return lines.length > 0 ? lines.join(' ') : null;
};
